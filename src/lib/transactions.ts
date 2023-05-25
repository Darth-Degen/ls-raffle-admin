import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  BlockheightBasedTransactionConfirmationStrategy,
  Connection,
  Keypair,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  Signer,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import { toast } from "react-hot-toast";

async function createLookupTable(
  connection: Connection,
  wallet: WalletContextState
) {
  const [lookupTableInst, newLookupTableAddress] = AddressLookupTableProgram.createLookupTable({
    authority: wallet.publicKey!,
    payer: wallet.publicKey!,
    recentSlot: await connection.getSlot(),
  });

  await executeTransaction(connection, wallet, [lookupTableInst]);

  return newLookupTableAddress;
}

async function extendLookupTable(
  connection: Connection,
  wallet: WalletContextState,
  lookupTableAddress: PublicKey,
  addressesToAdd: Array<any>
) {
  const batchSize = 30;
  const batches: PublicKey[][] = [];

  for (let i = 0; i < addressesToAdd.length; i += batchSize) {
    const chunk: PublicKey[] = addressesToAdd.slice(i, i + batchSize);
    batches.push(chunk);
  }

  for await (const addressesBatch of batches) {
    const extendInstruction = AddressLookupTableProgram.extendLookupTable({
      payer: wallet.publicKey!,
      authority: wallet.publicKey!,
      lookupTable: lookupTableAddress,
      addresses: addressesBatch,
    });

    await executeTransaction(connection, wallet, [extendInstruction]);
  }
}

export async function executeTransaction(
  connection: Connection,
  wallet: WalletContextState,
  instructions: TransactionInstruction[],
  options?: { signers: Keypair[] }
): Promise<RpcResponseAndContext<SignatureResult> | Error> {
  if (!wallet || !wallet.signTransaction) {
    toast.error("You need to connect your wallet to create the raffle.");
    return new Error('Wallet not connected');
  }

  let lookupTableAccount: AddressLookupTableAccount | null = null;

  const latestBlockhash = await connection.getLatestBlockhash();

  let messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey!,
    recentBlockhash: latestBlockhash.blockhash,
    instructions
  }).compileToV0Message();

  console.log('messageV0: ', messageV0);

  if (messageV0.staticAccountKeys.length > 26) {
    const newLookupTableAddress = await createLookupTable(
      connection,
      wallet
    );

    await extendLookupTable(
      connection,
      wallet,
      newLookupTableAddress,
      messageV0.staticAccountKeys
    );

    lookupTableAccount = await connection.getAddressLookupTable(newLookupTableAddress).then((res) => res.value);

    if (lookupTableAccount) {
      // console.log('Table address from cluster:', lookupTableAccount.key.toBase58());
      // for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
      //   const address = lookupTableAccount.state.addresses[i];
      //   console.log(i, address.toBase58());
      // }

      messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey!,
        recentBlockhash: latestBlockhash.blockhash,
        instructions
      }).compileToV0Message([lookupTableAccount]);
    } else {
      console.error("Could not fetch lookup table");
      return new Error(JSON.stringify({ err: "could not fetch lookup table" }));
    }
  }

  const transactionv0 = new VersionedTransaction(messageV0);

  if (options?.signers?.length) {
    transactionv0.sign([...options?.signers]);
  }

  const signedTransactionv0 = await wallet.signTransaction(transactionv0);

  const txSize = signedTransactionv0.serialize().length + (signedTransactionv0.signatures.length * 64);
  console.log('txSize: ', txSize);

  const signature = await connection.sendRawTransaction(signedTransactionv0.serialize(), { maxRetries: 5 });

  console.log('signature:', signature);

  const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature
  };

  return await connection.confirmTransaction(confirmStrategy);
}
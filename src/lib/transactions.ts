import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  BlockheightBasedTransactionConfirmationStrategy,
  Connection,
  Keypair,
  RpcResponseAndContext,
  SignatureResult,
  Signer,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import { toast } from "react-hot-toast";

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

  const latestBlockhash = await connection.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey!,
    recentBlockhash: latestBlockhash.blockhash,
    instructions
  }).compileToV0Message();

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
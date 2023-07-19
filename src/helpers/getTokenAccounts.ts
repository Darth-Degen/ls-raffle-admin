
import { Connection, GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
//read nft mint address from wallet
export const getTokenAccounts = async (connection: Connection, publicKey: PublicKey) => {

  if (!publicKey || !connection) return;

  try {
    // const mx = Metaplex.make(connection);
    // const tokens = await mx.nfts().findAllByOwner({ owner: new PublicKey(publicKey) });
    const wallet = publicKey?.toBase58();
    // const rpcEndpoint =
    //   "https://bold-cosmological-daylight.solana-mainnet.discover.quiknode.pro/d6b580eb3a983f95fece05b014d36fe7708d9dea/";
    // const rpcEndpoint = "https://rpc.hellomoon.io/3bd84347-2f2a-4be2-9653-bf99cce560c0";
    // const solanaConnection = new Connection(rpcEndpoint);
    const solanaConnection = connection;
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165, //size of account (bytes)
      },
      {
        memcmp: {
          offset: 32, //location of our query in the account (bytes)
          bytes: wallet, //our search criteria, a base58 encoded string
        },
      },
    ];
    let accounts = await solanaConnection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      { filters: filters }
    );
    // console.log(
    //   `Found ${accounts.length} token account(s) for wallet ${wallet}.`
    // );
    accounts = accounts.filter((account, i) => {
      //Parse the account data
      const parsedAccountInfo: any = account.account.data;
      const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance: number =
        parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      //Log results
      if (tokenBalance > 1) {
        // console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
        // console.log(`--Token Mint: ${mintAddress}`);
        // console.log(`--Token Balance: ${tokenBalance}`);
        return true
      }
    });
    // console.log("token accounts ", accounts)
    return accounts;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to load spl tokens"
    console.error("getTokenAccounts ", message);
    return message;
  }
};  


import { Connection, PublicKey } from "@solana/web3.js";

import { FindNftsByOwnerOutput, Metaplex } from "@metaplex-foundation/js";
 //read nft mint address from wallet
export const getTokensByOwner = async (connection: Connection, publicKey:PublicKey | null )
  : Promise<FindNftsByOwnerOutput  | undefined> => {

  if (!publicKey) return;

  try {
    const mx = Metaplex.make(connection);
    const tokens = await mx.nfts().findAllByOwner({ owner: new PublicKey(publicKey) });
    
    return tokens;
  } catch (e) {
    console.error("getTokensByOwner ", e);
    return undefined;
  }
}; 
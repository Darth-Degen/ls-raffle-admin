import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Expo } from "./idl/expo";
import { getMinimumBalanceForRentExemptAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { EXPO_PROGRAM_ID } from "src/constants";

export class ExpoClient {
  wallet: anchor.Wallet;
  conn: Connection;
  provider!: anchor.Provider;
  expoProgram!: anchor.Program<Expo>;

  constructor(
    conn: Connection,
    wallet: anchor.Wallet,
    idl?: anchor.Idl,
    programId?: PublicKey
  ) {
    this.conn = conn;
    this.wallet = wallet;
    this.setProvider();
    this.setExpoProgram(idl, programId);
  }

  setProvider() {
    this.provider = new anchor.AnchorProvider(
      this.conn,
      this.wallet,
      anchor.AnchorProvider.defaultOptions()
    );
    anchor.setProvider(this.provider);
  }

  async createRaffle(
    proceedsMint: PublicKey,
    endTimestamp: anchor.BN,
    ticketPrice: anchor.BN,
    maxEntrants: number = 500
  ): Promise<{ signers: Keypair, instructions: TransactionInstruction[] }> {
    let entrantsKeypair = new Keypair();

    let [raffle, _raffleBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("raffle"), entrantsKeypair.publicKey.toBytes()],
      this.expoProgram.programId
    );

    let [proceeds, _proceedsBump] = PublicKey.findProgramAddressSync(
      [raffle.toBytes(), Buffer.from("proceeds")],
      this.expoProgram.programId
    );

    let entrantsAccountSize = 8 + 4 + 4 + 32 * maxEntrants;

    const createEntrantsIx = SystemProgram.createAccount({
      fromPubkey: new PublicKey(this.wallet.publicKey),
      newAccountPubkey: entrantsKeypair.publicKey,
      lamports: await this.conn.getMinimumBalanceForRentExemption(entrantsAccountSize),
      programId: EXPO_PROGRAM_ID,
      space: entrantsAccountSize
    });

    const createRaffleIx = await this.expoProgram.methods.createRaffle(endTimestamp, ticketPrice, maxEntrants).accounts({
      raffle,
      entrants: entrantsKeypair.publicKey,
      creator: new PublicKey(this.wallet.publicKey),
      proceeds,
      proceedsMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY
    }).instruction();

    return {
      signers: entrantsKeypair,
      instructions: [createEntrantsIx, createRaffleIx]
    };
  }

  setExpoProgram(idl?: anchor.Idl, programId?: PublicKey) {
    if (idl && programId) {
      // Prod
      this.expoProgram = new anchor.Program<Expo>(
        idl as any,
        programId,
        this.provider
      );
    } else {
      // Tests
      this.expoProgram = anchor.workspace.GemBank as Program<Expo>;
    }
  }
}
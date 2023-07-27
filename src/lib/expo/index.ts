import { AccountInfo, Commitment, ComputeBudgetProgram, Connection, GetMultipleAccountsConfig, Keypair, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Expo } from "./idl/expo";
import { getAssociatedTokenAddress, getMinimumBalanceForRentExemptAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { EXPO_PROGRAM_ID } from "src/constants";
import { Metadata, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const TOKEN_AUTH_RULES_ID = new PublicKey("auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg");

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

  findMintMetadataId(mintId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintId.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )[0];
  };

  findMintEditionId(mintId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintId.toBuffer(),
        anchor.utils.bytes.utf8.encode("edition"),
      ],
      METADATA_PROGRAM_ID
    )[0];
  };

  getBatchedMultipleAccounts = async (
    connection: Connection,
    ids: PublicKey[],
    config?: GetMultipleAccountsConfig | Commitment,
    batchSize = 100
  ) => {
    const batches: PublicKey[][] = [[]];
    ids.forEach((id) => {
      const batch = batches[batches.length - 1];
      if (batch) {
        if (batch.length >= batchSize) {
          batches.push([id]);
        } else {
          batch.push(id);
        }
      }
    });
    const batchAccounts = await Promise.all(
      batches.map((b) =>
        b.length > 0 ? connection.getMultipleAccountsInfo(b, config) : []
      )
    );
    return batchAccounts.flat();
  };

  fetchAccountDataById = async (
    connection: Connection,
    ids: (PublicKey | null)[]
  ): Promise<{
    [accountId: string]: AccountInfo<Buffer> & { pubkey: PublicKey };
  }> => {
    const filteredIds = ids.filter((id): id is PublicKey => id !== null);
    const accountInfos = await this.getBatchedMultipleAccounts(
      connection,
      filteredIds
    );
    return accountInfos.reduce((acc, accountInfo, i) => {
      if (!accountInfo?.data) return acc;
      const pubkey = ids[i];
      if (!pubkey) return acc;
      acc[pubkey.toString()] = {
        pubkey,
        ...accountInfo,
      };
      return acc;
    }, {} as { [accountId: string]: AccountInfo<Buffer> & { pubkey: PublicKey } });
  };

  findTokenRecordId(
    mint: PublicKey,
    token: PublicKey
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("token_record"),
        token.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )[0];
  }

  findRuleSetId(authority: PublicKey, name: string) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("rule_set"), authority.toBuffer(), Buffer.from(name)],
      TOKEN_AUTH_RULES_ID
    )[0];
  };

  async createRaffle(
    proceedsMint: PublicKey,
    endTimestamp: anchor.BN,
    ticketPrice: anchor.BN,
    maxEntrants: number = 500,
    nftMints: PublicKey[],
    selectedSpl: PublicKey | undefined,
    splAmount: anchor.BN,
    raffleMode: any
  ): Promise<{ signers: Keypair, instructions: TransactionInstruction[], raffle: PublicKey }> {
    let entrantsKeypair = new Keypair();

    let [raffle, _raffleBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("raffle"), entrantsKeypair.publicKey.toBytes()],
      this.expoProgram.programId
    );

    let [proceeds, _proceedsBump] = PublicKey.findProgramAddressSync(
      [raffle.toBytes(), Buffer.from("proceeds")],
      this.expoProgram.programId
    );

    let entrantsAccountSize = 8 + 4 + 4 + (32 * maxEntrants);

    const createEntrantsIx = SystemProgram.createAccount({
      fromPubkey: new PublicKey(this.wallet.publicKey),
      newAccountPubkey: entrantsKeypair.publicKey,
      lamports: await this.conn.getMinimumBalanceForRentExemption(entrantsAccountSize),
      programId: EXPO_PROGRAM_ID,
      space: entrantsAccountSize
    });

    const createRaffleIx = await this.expoProgram.methods.createRaffle(endTimestamp, ticketPrice, maxEntrants, raffleMode).accounts({
      raffle,
      entrants: entrantsKeypair.publicKey,
      creator: new PublicKey(this.wallet.publicKey),
      proceeds,
      proceedsMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY
    }).instruction();

    const addPrizeIxs: TransactionInstruction[] = [];

    const allPrizes: any = [...nftMints];
    if (selectedSpl && splAmount) {
      allPrizes.push({ selectedSpl, splAmount });
    }

    for await (let [index, nftMint] of allPrizes.entries()) {
      const prizeAmount = nftMint.splAmount ? splAmount : new anchor.BN(1);
      const prizeIndex = index;
      const prizeIndexArray = Buffer.from(new Uint32Array([prizeIndex]).buffer);

      const [prize, _prizeBump] = PublicKey.findProgramAddressSync(
        [raffle.toBytes(), Buffer.from("prize"), prizeIndexArray],
        this.expoProgram.programId
      );

      let mintMetadataId = this.findMintMetadataId(nftMint);
      let metdataInfo = await this.fetchAccountDataById(this.conn, [mintMetadataId])
      const metadataAccountInfo = metdataInfo[mintMetadataId.toString()] ?? null;
      const mintMetadata = metadataAccountInfo
        ? Metadata.deserialize(metadataAccountInfo.data)[0]
        : null;

      const createPrizeTokenAccount = await getAssociatedTokenAddress(
        nftMint.selectedSpl ? new PublicKey(nftMint.selectedSpl) : nftMint,
        new PublicKey(this.wallet.publicKey)
      );

      if (
        mintMetadata?.tokenStandard === TokenStandard.ProgrammableNonFungible &&
        mintMetadata.programmableConfig
      ) {
        //// PROGRAMMABLE ////
        addPrizeIxs.push(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 100000000,
          })
        );

        const addPrizeIx = await this.expoProgram.methods.addPrizeProgrammable(prizeIndex, prizeAmount).accounts({
          raffle,
          creator: new PublicKey(this.wallet.publicKey),
          from: createPrizeTokenAccount,
          prizeMint: nftMint.selectedSpl ? new PublicKey(nftMint.selectedSpl) : nftMint,
          mintMetadata: mintMetadataId,
          mintEdition: this.findMintEditionId(nftMint),
          rafflePrizeTokenAccount: prize,
          rafflePrizeTokenRecord: this.findTokenRecordId(nftMint, prize),
          creatorPrizeTokenRecord: this.findTokenRecordId(nftMint, createPrizeTokenAccount),
          tokenMetadataProgram: METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          authorizationRules:
            mintMetadata.programmableConfig?.ruleSet ?? METADATA_PROGRAM_ID,
          authorizationRulesProgram: TOKEN_AUTH_RULES_ID,
        }).instruction();

        addPrizeIxs.push(addPrizeIx);

      } else {
        //// NON-PROGRAMMABLE ////
        const addPrizeIx = await this.expoProgram.methods.addPrize(prizeIndex, prizeAmount).accounts({
          raffle,
          creator: new PublicKey(this.wallet.publicKey),
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          from: createPrizeTokenAccount,
          prize,
          prizeMint: nftMint.selectedSpl ? new PublicKey(nftMint.selectedSpl) : nftMint
        }).instruction();

        addPrizeIxs.push(addPrizeIx);
      }
    }

    return {
      signers: entrantsKeypair,
      instructions: [createEntrantsIx, createRaffleIx], //, ...addPrizeIxs]
      raffle
    };
  }

  async addSplPrize(
    entrantsKeypair: PublicKey,
    prizeMint: PublicKey,
    splAmount: anchor.BN,
    prizeIndex: number,
    raffleId?: PublicKey
  ) {
    let [raffle] = raffleId
      ? [raffleId]
      : PublicKey.findProgramAddressSync(
        [Buffer.from("raffle"), entrantsKeypair.toBytes()],
        this.expoProgram.programId
      );

    const prizeAmount = splAmount ?? new anchor.BN(1);
    const prizeIndexArray = Buffer.from(new Uint32Array([prizeIndex]).buffer);

    const [prize, _prizeBump] = PublicKey.findProgramAddressSync(
      [raffle.toBytes(), Buffer.from("prize"), prizeIndexArray],
      this.expoProgram.programId
    );

    const createPrizeTokenAccount = await getAssociatedTokenAddress(
      prizeMint,
      new PublicKey(this.wallet.publicKey)
    );

    const addPrizeIx = await this.expoProgram.methods.addPrize(prizeIndex, prizeAmount).accounts({
      raffle,
      creator: new PublicKey(this.wallet.publicKey),
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      from: createPrizeTokenAccount,
      prize,
      prizeMint
    }).instruction();

    return addPrizeIx;
  }

  async updateEndDate(raffle: PublicKey, endDate: anchor.BN) {
    return await this.expoProgram.methods.updateEndDate(endDate).accounts({
      raffle: raffle,
      creator: this.wallet.publicKey
    }).instruction();
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
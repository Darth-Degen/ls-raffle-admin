import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Expo } from "src/lib/expo/idl/expo";

export * from "./framer.config"
export * from "./token-registry"

export const EXPO_PROGRAM_ID = new PublicKey("5q3XmcuGp3upn9ASY6GLtPyKXEMWWaast2QyDFcaXvXS");

export const RAFFLE_MODE_MULTI_WINNERS: anchor.IdlTypes<Expo>["RaffleMode"] = { multiWinners: {} };
export const RAFFLE_MODE_SINGLE_WINNER: anchor.IdlTypes<Expo>["RaffleMode"] = { singleWinner: {} };
export const RAFFLE_MODE_MULTI_WINNERS_LABEL: string = "Multi Winners mode";
export const RAFFLE_MODE_SINGLE_WINNER_LABEL: string = "Single Winner mode";
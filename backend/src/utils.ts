import { BiconomySmartAccountV2 } from "@biconomy/account";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, http } from "viem";
import { morphHolesky } from "viem/chains";
import {
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "./constant";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {
          // the data expected from .select()
          id: number;
          name: string;
          data: Json | null;
        };
        Insert: {
          // the data to be passed to .insert()
          id?: never; // generated columns must not be supplied
          name: string; // `not null` columns with no default must be supplied
          data?: Json | null; // nullable columns can be omitted
        };
        Update: {
          // the data to be passed to .update()
          id?: never;
          name?: string; // `not null` columns are optional on .update()
          data?: Json | null;
        };
      };
    };
  };
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchUserByID = async (user_id: string) => {
  const { data, error } = await supabase
    .from("user-address")
    .select("*")
    .eq("user_id", user_id);
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  console.log(data[0].id);
  return data[0].id;
};

export const payforQuery = async (smartAccount: BiconomySmartAccountV2) => {
  const tx = await smartAccount.sendTransaction({
    to: process.env.RECEIVER_ADDRESS!,
    value: process.env.QUERY_PRICE || 0.0002,
  });
  const { transactionHash } = await tx.waitForTxHash();
  console.log("Transaction Hash", transactionHash);

  const userOpReceipt = await tx.wait();
  console.log("Transaction Receipt", userOpReceipt);
  // return tx;
};
// ***************************************** || 0.001*******

const publicClient = createPublicClient({
  chain: morphHolesky,
  transport: http(),
});

export const getActiveSubcription = async (userAddress: string) => {
  const data = await publicClient.readContract({
    address: SUBSCRIPTION_CONTRACT_ADDRESS,
    abi: SUBSCRIPTION_CONTRACT_ABI,
    functionName: "hasActiveSubscription",
    args: [userAddress],
  });

  return data;
};

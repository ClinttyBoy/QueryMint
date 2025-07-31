import { BiconomySmartAccountV2, PaymasterMode } from "@biconomy/account";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, http, parseEther } from "viem";
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

type ChatSession = {
  id?: string | number;
  service_id: string;
  question: string;
  answer: string;
  rating?: number;
  txId?: string;
};

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

// export const addChatData = async (user_id: string) => {
  // const { data, error } = await supabase
  //   .from("chat-sessions")
  //   .insert([{ service_id}])
  //   .select();
  // if (error) {
  //   console.error("Error fetching user:", error);
  //   return null;
  // }
  // console.log(data[0].id);
  // return data[0].id;
// };

export const payforQuery = async (smartAccount: BiconomySmartAccountV2) => {
  const getBalance = await smartAccount.getBalances();
  const balance = formatBalance(getBalance[0].amount, getBalance[0].decimals);
  console.log("balance", balance);

  if (Number(balance) < Number(process.env.QUERY_PRICE || 0.0002)) {
    console.log("Insufficient balance");
    return false;
  }

  try {
    const tx = await smartAccount.sendTransaction(
      {
        to: process.env.RECEIVER_ADDRESS!,
        value: parseEther(process.env.QUERY_PRICE?.toString() || "0.0002"),
      },
      {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      }
    );
    const { transactionHash } = await tx.waitForTxHash();
    console.log("Transaction Hash", transactionHash);

    const userOpReceipt = await tx.wait();
    console.log("Transaction Status: ", userOpReceipt.success);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Transaction Error:", error);
    }
  }
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

export function formatBalance(
  amount: bigint | string,
  decimals: number,
  precision = 6
) {
  const amt = typeof amount === "bigint" ? amount : BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amt / divisor;
  const fraction = amt % divisor;
  // Get the fraction as a string, padded with zeros
  let fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, precision);
  // Remove trailing zeros
  fractionStr = fractionStr.replace(/0+$/, "");
  return `${whole.toString()}${fractionStr ? "." + fractionStr : ""}`;
}

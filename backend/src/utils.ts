import { BiconomySmartAccountV2, PaymasterMode } from "@biconomy/account";
import { createClient } from "@supabase/supabase-js";
import {
  createPublicClient,
  decodeEventLog,
  encodeFunctionData,
  http,
  parseEther,
} from "viem";
import { morphHolesky } from "viem/chains";
import {
  RATING_CONTRACT_ABI,
  RATING_CONTRACT_ADDRESS,
  ratingNFTTokenURI,
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

interface ChatSession {
  id?: string | number;
  service_id: string;
  question: string;
  answer: string;
  rating?: number;
  txId?: string | null;
}

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

const publicClient = createPublicClient({
  chain: morphHolesky,
  transport: http(),
});

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

export const addChatData = async (args: ChatSession) => {
  const { data, error } = await supabase
    .from("chat-sessions")
    .insert([args])
    .select();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  console.log(data);
};

export const mintRatingNFT = async (
  smartAccount: BiconomySmartAccountV2,
  address: string,
  rating: number,
  serviceId: string
) => {
  try {
    const tokenID = await getTokenIdCounter();
    if (!tokenID) return null;

    const nftData = encodeFunctionData({
      abi: RATING_CONTRACT_ABI,
      functionName: "mintRatingNFT",
      args: [address, rating, serviceId, ratingNFTTokenURI[rating]],
    });

    // ------ 4. Send transaction
    const userOpResponse = await smartAccount.sendTransaction(
      {
        to: RATING_CONTRACT_ADDRESS,
        data: nftData,
      },
      {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      }
    );

    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log("transactionHash", transactionHash);
    console.log("tokenId: " + tokenID);
    await userOpResponse.wait();
    return tokenID;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Transaction Error:", error.message);
    }
    return null;
  }
};
export const addRatingToDB = async (
  id: string,
  rating: number,
  ratingToken: number
) => {
  const { data, error } = await supabase
    .from("chat-sessions")
    .update({ rating, ratingToken })
    .eq("id", id)
    .select();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  console.log(data);
};

export const payforQuery = async (smartAccount: BiconomySmartAccountV2) => {
  const getBalance = await smartAccount.getBalances();
  const balance = formatBalance(getBalance[0].amount, getBalance[0].decimals);
  console.log("balance", balance);

  if (Number(balance) < Number(process.env.QUERY_PRICE || 0.0002)) {
    console.log("Insufficient balance");
    return null;
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
    return transactionHash;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Transaction Error:", error);
    }
  }
};
// ***************************************** || 0.001*******

export const getTokenIdCounter = async () => {
  const data = await publicClient.readContract({
    address: RATING_CONTRACT_ADDRESS,
    abi: RATING_CONTRACT_ABI,
    functionName: "tokenIdCounter",
  });

  return data;
};
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

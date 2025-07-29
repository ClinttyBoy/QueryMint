import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Service } from "@/types/Service";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
  // console.log(data?.length === 0 ? "empty" : "not empty");
  return data;
};

export const insertUser = async (email: string) => {
  const { data, error } = await supabase
    .from("user-address")
    .insert([{ user_id: hashEmail(email), email }])
    .select();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  console.log(data);

  return data[0];
};

// ***************************************** || 0.001*******

const QUERY_PRICE = Number(process.env.NEXT_PUBLIC_QUERY_PRICE) || 0.0002;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashEmail(email: string): string {
  return `querymint-${createHash("sha256")
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 16)}z`;
}

export const shortenAddress = (address: string, starting = 4, ending = 4) => {
  if (!address) {
    return "";
  }

  const start = address.slice(0, starting);
  const end = address.slice(-ending);

  return `${start}...${end}`;
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

export function balanceToQueries(balance: number) {
  return Math.floor(balance / QUERY_PRICE);
}

export function isFloatString(str: string): boolean {
  return /^\d+(\.\d+)?$/.test(str.trim());
}

export function getInitials(name: string = "AB"): string {
  const words = name.trim().split(/\s+/);
  const initials = words.slice(0, 2).map((word) => word[0].toUpperCase());
  return initials.join("");
}
export async function loadAndSplitTextFromBlob(
  file: File
): Promise<Document[]> {
  const text = await file.text(); // read uploaded .txt file as string

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  return docs;
}

export const createJsonFileFromDocs = (
  docs: Document[],
  filename = "vector-response.json"
) => {
  const json = JSON.stringify(docs, null, 2); // Pretty-print the structure
  return new File([json], filename, { type: "application/json" });
};

export function generateEmbedIframe(
  endpoint: string,
  userId: string,
  projectId: string,
  data_url: string
): string {
  const src = `${endpoint}/chat.html?userId=${encodeURIComponent(
    userId
  )}&projectId=${encodeURIComponent(projectId)}&dataUrl=${encodeURIComponent(
    data_url
  )}`;

  return `<iframe
  src="${src}"
  width="300"
  height="400"
  style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          border: "none",
          zIndex: 9999,
        }}
></iframe>`;
}

export const toDate = (timestamp: number) => new Date(timestamp * 1000);

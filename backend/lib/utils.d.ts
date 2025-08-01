import { BiconomySmartAccountV2 } from "@biconomy/account";
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
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
                    id: number;
                    name: string;
                    data: Json | null;
                };
                Insert: {
                    id?: never;
                    name: string;
                    data?: Json | null;
                };
                Update: {
                    id?: never;
                    name?: string;
                    data?: Json | null;
                };
            };
        };
    };
}
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const fetchUserByID: (user_id: string) => Promise<any>;
export declare const addChatData: (args: ChatSession) => Promise<null | undefined>;
export declare const mintRatingNFT: (smartAccount: BiconomySmartAccountV2, address: string, rating: number, serviceId: string) => Promise<{} | null>;
export declare const addRatingToDB: (id: string, rating: number, ratingToken: number) => Promise<null | undefined>;
export declare const payforQuery: (smartAccount: BiconomySmartAccountV2) => Promise<string | null | undefined>;
export declare const getTokenIdCounter: () => Promise<unknown>;
export declare const getActiveSubcription: (userAddress: string) => Promise<unknown>;
export declare function formatBalance(amount: bigint | string, decimals: number, precision?: number): string;
export {};

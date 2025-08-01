"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSubcription = exports.getTokenIdCounter = exports.payforQuery = exports.addRatingToDB = exports.mintRatingNFT = exports.addChatData = exports.fetchUserByID = exports.supabase = void 0;
exports.formatBalance = formatBalance;
const account_1 = require("@biconomy/account");
const supabase_js_1 = require("@supabase/supabase-js");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const constant_1 = require("./constant");
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.morphHolesky,
    transport: (0, viem_1.http)(),
});
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
const fetchUserByID = async (user_id) => {
    const { data, error } = await exports.supabase
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
exports.fetchUserByID = fetchUserByID;
const addChatData = async (args) => {
    const { data, error } = await exports.supabase
        .from("chat-sessions")
        .insert([args])
        .select();
    if (error) {
        console.error("Error fetching user:", error);
        return null;
    }
    console.log(data);
};
exports.addChatData = addChatData;
const mintRatingNFT = async (smartAccount, address, rating, serviceId) => {
    try {
        const tokenID = await (0, exports.getTokenIdCounter)();
        if (!tokenID)
            return null;
        const nftData = (0, viem_1.encodeFunctionData)({
            abi: constant_1.RATING_CONTRACT_ABI,
            functionName: "mintRatingNFT",
            args: [address, rating, serviceId, constant_1.ratingNFTTokenURI[rating]],
        });
        // ------ 4. Send transaction
        const userOpResponse = await smartAccount.sendTransaction({
            to: constant_1.RATING_CONTRACT_ADDRESS,
            data: nftData,
        }, {
            paymasterServiceData: { mode: account_1.PaymasterMode.SPONSORED },
        });
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("transactionHash", transactionHash);
        console.log("tokenId: " + tokenID);
        await userOpResponse.wait();
        return tokenID;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Transaction Error:", error.message);
        }
        return null;
    }
};
exports.mintRatingNFT = mintRatingNFT;
const addRatingToDB = async (id, rating, ratingToken) => {
    const { data, error } = await exports.supabase
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
exports.addRatingToDB = addRatingToDB;
const payforQuery = async (smartAccount) => {
    const getBalance = await smartAccount.getBalances();
    const balance = formatBalance(getBalance[0].amount, getBalance[0].decimals);
    console.log("balance", balance);
    if (Number(balance) < Number(process.env.QUERY_PRICE || 0.0002)) {
        console.log("Insufficient balance");
        return null;
    }
    try {
        const tx = await smartAccount.sendTransaction({
            to: process.env.RECEIVER_ADDRESS,
            value: (0, viem_1.parseEther)(process.env.QUERY_PRICE?.toString() || "0.0002"),
        }, {
            paymasterServiceData: { mode: account_1.PaymasterMode.SPONSORED },
        });
        const { transactionHash } = await tx.waitForTxHash();
        console.log("Transaction Hash", transactionHash);
        const userOpReceipt = await tx.wait();
        console.log("Transaction Status: ", userOpReceipt.success);
        return transactionHash;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Transaction Error:", error);
        }
    }
};
exports.payforQuery = payforQuery;
// ***************************************** || 0.001*******
const getTokenIdCounter = async () => {
    const data = await publicClient.readContract({
        address: constant_1.RATING_CONTRACT_ADDRESS,
        abi: constant_1.RATING_CONTRACT_ABI,
        functionName: "tokenIdCounter",
    });
    return data;
};
exports.getTokenIdCounter = getTokenIdCounter;
const getActiveSubcription = async (userAddress) => {
    const data = await publicClient.readContract({
        address: constant_1.SUBSCRIPTION_CONTRACT_ADDRESS,
        abi: constant_1.SUBSCRIPTION_CONTRACT_ABI,
        functionName: "hasActiveSubscription",
        args: [userAddress],
    });
    return data;
};
exports.getActiveSubcription = getActiveSubcription;
function formatBalance(amount, decimals, precision = 6) {
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

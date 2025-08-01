"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = void 0;
const account_1 = require("@biconomy/account");
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const createAccount = async (index) => {
    try {
        const account = (0, accounts_1.privateKeyToAccount)(`0x${process.env.PRIVATE_KEY}`);
        const client = (0, viem_1.createWalletClient)({
            account,
            chain: chains_1.morphHolesky,
            transport: (0, viem_1.http)(),
        });
        const smartAccount = await account_1.BiconomySmartAccountV2.create({
            signer: client,
            index,
            bundlerUrl: process.env.BUNDLER_URL,
            paymasterUrl: process.env.PAYMASTER_URL,
        });
        //   setSmartAccount(smartAccount);
        return smartAccount;
    }
    catch (error) {
        console.error("Error creating smart account:", error);
        throw error;
    }
};
exports.createAccount = createAccount;

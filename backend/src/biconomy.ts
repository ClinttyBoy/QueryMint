import { BiconomySmartAccountV2 } from "@biconomy/account";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { morphHolesky } from "viem/chains";

export const createAccount = async (index: number) => {
  try {
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

    const client = createWalletClient({
      account,
      chain: morphHolesky,
      transport: http(),
    });

    const smartAccount = await BiconomySmartAccountV2.create({
      signer: client,
      index,
      bundlerUrl: process.env.BUNDLER_URL!,
      paymasterUrl: process.env.PAYMASTER_URL!,
    });
    //   setSmartAccount(smartAccount);

    return smartAccount;
  } catch (error) {
    console.error("Error creating smart account:", error);
    throw error;
  }
};

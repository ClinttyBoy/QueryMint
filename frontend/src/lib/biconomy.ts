import { createSmartAccountClient } from "@biconomy/account";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { morphHolesky } from "viem/chains";

export const createAccount = async (index: number) => {

  try {
    const account = privateKeyToAccount(
      `0x${process.env.NEXT_PUBLIC_PRIVATE_KEY}`
    );

    const client = createWalletClient({
      account,
      chain: morphHolesky,
      transport: http(),
    });


    const config = {
      signer: client,
      index,
      bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
    };

    const smartAccount = await createSmartAccountClient(config);
    //   setSmartAccount(smartAccount);

    return smartAccount;
  } catch (error) {
    console.error("Error creating smart account:", error);
    throw error;
  }
};

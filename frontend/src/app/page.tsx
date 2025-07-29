"use client";

import Image from "next/image";
import { createWalletClient, encodeFunctionData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
} from "@biconomy/account";
import { morphHolesky } from "viem/chains";
import { useState } from "react";
import { insertUser } from "@/lib/utils";
import { RATING_CONTRACT_ABI, RATING_CONTRACT_ADDRESS } from "@/lib/constant";
import { useUserData } from "@/contexts/UserContext";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button
        onClick={async () => {
          await insertUser("sdff");
        }}
      >
        insertUser
      </button>
    </div>
  );
}

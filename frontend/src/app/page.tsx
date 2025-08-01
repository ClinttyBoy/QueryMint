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
      <iframe
        src="http://localhost:3001/chat.html?userId=querymint-94033f21c2de4dafz&serviceId=976d27b9-7044-4640-acf7-f9276fb2f63c&dataUrl=https%3A%2F%2Fgateway.pinata.cloud%2Fipfs%2Fbafkreibjkqybrubdr2hm3dhsatmqqusfuu6l3yvvuephyd3kjgazsmkdc4"
        width="300"
        height="400"
        style={{
          position: "fixed",
          backgroundColor: "transparent",
          bottom: "20px",
          right: "20px",
          border: "none",
          zIndex: 9999,
        }}
      ></iframe>
    </div>
  );
}

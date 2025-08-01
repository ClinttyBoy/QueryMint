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
import { generateEmbedURL, insertUser } from "@/lib/utils";
import { RATING_CONTRACT_ABI, RATING_CONTRACT_ADDRESS } from "@/lib/constant";
import { useUserData } from "@/contexts/UserContext";

export default function Home() {
  const { userId } = useUserData();
  const service = {
    id: "1b9df16c-bb99-470a-91df-45e77b667474",
    user_id: "querymint-94033f21c2de4dafz",
    logo_url:
      "https://gateway.pinata.cloud/ipfs/bafkreifgdtsev3k25ldfzb2gg5eulyfnsytckhiawhcj7gx3xkvp6crq7m",
    model: "Claude 3 Opus",
    data_url:
      "https://gateway.pinata.cloud/ipfs/bafkreibjkqybrubdr2hm3dhsatmqqusfuu6l3yvvuephyd3kjgazsmkdc4",
    website_url: "https://omkar-ten.vercel.app/",
    embedded_url:
      '<iframe\n  src="localhost:3001/chat.html?userId=querymint-94033f21c2de4dafz&projectId=1b9df16c-bb99-470a-91df-45e77b667474&dataUrl=https%3A%2F%2Fgateway.pinata.cloud%2Fipfs%2Fbafkreicpkpg2ddblvigagvf3l6nd5s7f5ujkwtmocg5iopbpcelbeavziu"\n  width="300"\n  height="400"\n  style={{\n          position: "fixed",\n          bottom: "20px",\n          right: "20px",\n          border: "none",\n          zIndex: 9999,\n        }}\n></iframe>',
    name: "test1",
  };
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button
        onClick={async () => {
          await insertUser("sdff");
        }}
      >
        insertUser
      </button>
      {/* <iframe
        src="http://localhost:3001/chat.html?userId=querymint-0eebe8ee6e4b4645z&serviceId=976d27b9-7044-4640-acf7-f9276fb2f63c&dataUrl=https%3A%2F%2Fgateway.pinata.cloud%2Fipfs%2Fbafkreibjkqybrubdr2hm3dhsatmqqusfuu6l3yvvuephyd3kjgazsmkdc4"
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
      ></iframe> */}
      <iframe
        src={generateEmbedURL(
          process.env.NEXT_PUBLIC_BACKEND_ENDPOINT ?? "",
          userId,
          service.id,
          service.data_url
        )}
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

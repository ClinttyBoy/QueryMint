// src/index.ts
import express, { Request, Response } from "express";
import { fetchVector } from "./pinata";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { buildGraph } from "./chatbot";
import {
  addChatData,
  addRatingToDB,
  fetchUserByID,
  getActiveSubcription,
  mintRatingNFT,
  payforQuery,
} from "./utils";
import { createAccount } from "./biconomy";
import { embeddings } from "./embeddings";

const app = express();
const PORT = process.env.PORT || 3001;

// Add body parser middleware
app.use(express.json());
app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});


// POST /prompt route (for chat.html frontend)
app.post("/prompt", async (req: Request, res: Response) => {
  const { prompt, dataUrl, userId, serviceId, conversationId } = req.body;
  console.log("Prompt request:", {
    prompt,
    dataUrl,
    userId,
    serviceId,
    conversationId,
  });

  if (!dataUrl || !prompt) {
    return res
      .status(400)
      .json({ error: "Both dataUrl and prompt are required!" });
  }

  const userID = await fetchUserByID(userId);
  console.log("userIndex", userID);
  const smartAccount = await createAccount(userID);

  if (!userID || !smartAccount) {
    return res.status(400).json({ error: "Unable to find user are required!" });
  }

  const saAddress = await smartAccount.getAccountAddress();
  console.log("address", saAddress);
  const isActiveSubscription = await getActiveSubcription(saAddress);
  let txId = null;
  if (!isActiveSubscription) {
    console.log("paying for query");
    txId = await payforQuery(smartAccount);
    if (!txId) {
      return res
        .status(400)
        .json({ reply: "Please add funds to your QueryMint account!" });
    }
  } else {
    console.log("active subscription");
  }

  try {
    const docs = (await fetchVector(dataUrl)) as Object;

    if (!Array.isArray(docs)) {
      throw new Error("Expected data to be an array of Document objects");
    }

    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(docs);
    const graph = await buildGraph(vectorStore);

    const result = await graph.invoke({ question: prompt });
    await addChatData({
      id: conversationId,
      question: prompt,
      service_id: serviceId,
      answer: result.answer,
      txId,
    });
    console.log("AI Response:", result.answer);
    res.status(200).json({ reply: result.answer });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/rate", async (req: Request, res: Response) => {
  const { rating, userId, serviceId, conversationId } = req.body;

  if (!rating || !conversationId || !userId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const userID = await fetchUserByID(userId);
  console.log("userIndex", userID);
  const smartAccount = await createAccount(userID);

  if (!userID || !smartAccount) {
    return res.status(400).json({ error: "Unable to find user are required!" });
  }
  const address = await smartAccount.getAccountAddress();

  // Store this in a DB — for now, just log
  const tokenId = await mintRatingNFT(smartAccount, address, rating, serviceId);
  if (!tokenId) {
    return res.status(400).json({ error: "Error in Rating NFT minting!" });
  }
  await addRatingToDB(conversationId, rating, Number(tokenId));
  console.log("Rating received:", {
    rating,
    userId,
    serviceId,
    conversationId,
  });

  // TODO: Save this in a `chat_ratings` or `conversation_feedback` table

  res.status(200).json({ message: "Rating received", status: true });
});

app.get("/test", (req, res) => {
  res.json({ message: "Its working!" });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

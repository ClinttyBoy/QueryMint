// src/index.ts
import express, { Request, Response } from "express";
import { fetchVector } from "./pinata";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { buildGraph, embeddings } from "./chatbot";
import { fetchUserByID, getActiveSubcription, payforQuery } from "./utils";
import { createAccount } from "./biconomy";

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

// Serve chat.html at root
app.get("/", (req: Request, res: Response) => {
  res.sendFile("chat.html", { root: "./public" });
});

// POST /prompt route (for chat.html frontend)
app.post("/prompt", async (req: Request, res: Response) => {
  const { prompt, dataUrl, userId, projectId } = req.body;
  console.log("Prompt request:", { prompt, dataUrl, userId, projectId });

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

  if (!isActiveSubscription) {
    console.log("paying for query");
    const result = await payforQuery(smartAccount);
    if (!result) {
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
    console.log("AI Response:", result.answer);
    res.status(200).json({ reply: result.answer });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

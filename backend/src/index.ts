// src/index.ts
import express, { Request, Response } from "express";
import { fetchVector } from "./pinata";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { buildGraph, embeddings } from "./chatbot";

const app = express();
const PORT = process.env.PORT || 3000;

// POST /chat route
app.post("/chat", async (req: Request, res: Response) => {
  const { prompt, dataUrl } = req.body;
  console.log(prompt, dataUrl);

  if (!dataUrl || !prompt) {
    res.status(400).json({ error: "Both dataUrl and prompt are required!" });
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
    console.log(result.answer);
    res.status(200).json({ reply: result.answer });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Hello from Express + TypeScript!");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

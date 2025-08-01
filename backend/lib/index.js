"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const pinata_1 = require("./pinata");
const memory_1 = require("langchain/vectorstores/memory");
const chatbot_1 = require("./chatbot");
const utils_1 = require("./utils");
const biconomy_1 = require("./biconomy");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Add body parser middleware
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});
// Serve chat.html at root
app.get("/", (req, res) => {
    res.sendFile("chat.html", { root: "./public" });
});
// POST /prompt route (for chat.html frontend)
app.post("/prompt", async (req, res) => {
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
    const userID = await (0, utils_1.fetchUserByID)(userId);
    console.log("userIndex", userID);
    const smartAccount = await (0, biconomy_1.createAccount)(userID);
    if (!userID || !smartAccount) {
        return res.status(400).json({ error: "Unable to find user are required!" });
    }
    const saAddress = await smartAccount.getAccountAddress();
    console.log("address", saAddress);
    const isActiveSubscription = await (0, utils_1.getActiveSubcription)(saAddress);
    let txId = null;
    if (!isActiveSubscription) {
        console.log("paying for query");
        txId = await (0, utils_1.payforQuery)(smartAccount);
        if (!txId) {
            return res
                .status(400)
                .json({ reply: "Please add funds to your QueryMint account!" });
        }
    }
    else {
        console.log("active subscription");
    }
    try {
        const docs = (await (0, pinata_1.fetchVector)(dataUrl));
        if (!Array.isArray(docs)) {
            throw new Error("Expected data to be an array of Document objects");
        }
        const vectorStore = new memory_1.MemoryVectorStore(chatbot_1.embeddings);
        await vectorStore.addDocuments(docs);
        const graph = await (0, chatbot_1.buildGraph)(vectorStore);
        const result = await graph.invoke({ question: prompt });
        await (0, utils_1.addChatData)({
            id: conversationId,
            question: prompt,
            service_id: serviceId,
            answer: result.answer,
            txId,
        });
        console.log("AI Response:", result.answer);
        res.status(200).json({ reply: result.answer });
    }
    catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/rate", async (req, res) => {
    const { rating, userId, serviceId, conversationId } = req.body;
    if (!rating || !conversationId || !userId) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    const userID = await (0, utils_1.fetchUserByID)(userId);
    console.log("userIndex", userID);
    const smartAccount = await (0, biconomy_1.createAccount)(userID);
    if (!userID || !smartAccount) {
        return res.status(400).json({ error: "Unable to find user are required!" });
    }
    const address = await smartAccount.getAccountAddress();
    // Store this in a DB — for now, just log
    const tokenId = await (0, utils_1.mintRatingNFT)(smartAccount, address, rating, serviceId);
    if (!tokenId) {
        return res.status(400).json({ error: "Error in Rating NFT minting!" });
    }
    await (0, utils_1.addRatingToDB)(conversationId, rating, Number(tokenId));
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

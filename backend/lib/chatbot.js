"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddings = void 0;
exports.buildGraph = buildGraph;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zod_1 = require("zod");
const google_genai_1 = require("@langchain/google-genai");
const aws_1 = require("@langchain/aws");
const prompts_1 = require("@langchain/core/prompts");
const langgraph_1 = require("@langchain/langgraph");
//chat model
const llm = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
});
//AI model
exports.embeddings = new aws_1.BedrockEmbeddings({
    model: "amazon.titan-embed-text-v1",
    region: process.env.BEDROCK_AWS_REGION || "",
    credentials: {
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY || "",
    },
});
const InputSchema = zod_1.z.object({
    question: zod_1.z.string(),
});
const FullStateSchema = zod_1.z.object({
    question: zod_1.z.string(),
    context: zod_1.z.array(zod_1.z.any()),
    answer: zod_1.z.string(),
});
async function buildGraph(vectorStore) {
    const promptTemplate = prompts_1.ChatPromptTemplate.fromMessages([
        [
            "system",
            `You are a friendly and professional customer support assistant. Respond clearly and helpfully using only the provided context. If the answer is not in the context, say "I'm not sure about that right now." Do not guess or make up information.`,
        ],
        ["human", "Context: {context}\n\nQuestion: {question}"],
    ]);
    const retrieve = async (state) => {
        const context = await vectorStore.similaritySearch(state.question, 4);
        return { context };
    };
    const generate = async (state) => {
        const docsText = state.context
            .map((doc) => doc.pageContent)
            .join("\n");
        const messages = await promptTemplate.formatMessages({
            question: state.question,
            context: docsText,
        });
        const result = await llm.invoke(messages);
        return { answer: result.content };
    };
    const graph = new langgraph_1.StateGraph(FullStateSchema)
        .addNode("retrieve", retrieve)
        .addNode("generate", generate)
        .addEdge("__start__", "retrieve")
        .addEdge("retrieve", "generate")
        .addEdge("generate", "__end__")
        .compile();
    return graph;
}

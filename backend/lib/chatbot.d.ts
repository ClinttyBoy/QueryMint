import { BedrockEmbeddings } from "@langchain/aws";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
export declare const embeddings: BedrockEmbeddings;
export declare function buildGraph(vectorStore: MemoryVectorStore): Promise<import("@langchain/langgraph").CompiledStateGraph<any, import("@langchain/langgraph").UpdateType<any> | Partial<any>, "__start__" | "retrieve" | "generate", any, any, import("@langchain/langgraph").StateDefinition>>;

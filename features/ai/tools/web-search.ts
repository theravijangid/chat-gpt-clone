import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

export const webSearchTool = tool({
  description:
    "Search the web for current information, news, recent events, documentation, prices, weather and facts that may have changed.",

  inputSchema: z.object({
    query: z.string().describe("Search query"),
  }),

  execute: async ({ query }) => {
    console.log("Searching************************", query);
    const response = await tvly.search(query, {
      maxResults: 2,
      topic: "general",
      searchDepth: "basic",
    });

    console.log("Found******************", response.results.length);

    return {
      query,
      results: response.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
      })),
    };
  },
});
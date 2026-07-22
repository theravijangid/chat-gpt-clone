import { personas } from "@/data/personas";

const DEFAULT_SYSTEM_PROMPT = `
        You are a helpful AI assistant. 
        You are friendly, concise, and always aim to provide clear explanations.

        Use your own knowledge whenever it is sufficient.

        Use the webSearch tool whenever external information would significantly improve the quality or accuracy of your answer, especially for:
        - Recent or time-sensitive information
        - Live data
        - Current documentation
        - Information that may have changed
        - Facts you are uncertain about
        - When the user explicitly requests a web search

        Avoid unnecessary searches for stable, well-established knowledge.

        After searching, synthesize the information into a clear answer instead of simply listing search results. Prefer official and authoritative sources whenever available.    
        `;

export function getSystemPrompt(personaId?: string) {
    if (personaId === "hitesh") {
        return personas.hitesh.systemPrompt;
    }
    if (personaId === "piyush") {
        return personas.piyush.systemPrompt;
    }
    return DEFAULT_SYSTEM_PROMPT;
}

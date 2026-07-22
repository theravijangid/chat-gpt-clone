import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { webSearchTool } from "@/features/ai/tools/web-search";
import { getChatModel } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/actions/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream, type UIMessage } from "ai"
import { getSystemPrompt } from "@/features/ai/utils/persona";


export async function POST(req: Request) {
    await auth.protect();

    const { message, id, personaId } : { message: UIMessage, id: string, personaId?: string } = await req.json()

    if(!message || !id) {
        return new Response("Missing messages or conversation id", { status: 400 })
    }
    debugger
    const user = await requireUser();

    const conversation = await prisma.conversation.findFirst({
        where: { 
            id,
            userId: user.id
        },
    })

    if (!conversation) {
        return new Response("Conversation not found", { status: 404 })
    }

    const previousMessages = await loadChatMessages(id);

    const alreadySaved = previousMessages.some(
        (storedMessage) => storedMessage.id === message.id
    )

    const messages = alreadySaved ? previousMessages : [...previousMessages, message];

    if(!alreadySaved) {
        await saveChatMessages(id, [message]);
    }

    const result = streamText({
        model: getChatModel(conversation.model),
        system: conversation.systemPrompt || getSystemPrompt(personaId),
        messages: await convertToModelMessages(messages),
        tools: {
            webSearch: webSearchTool,
        },
        stopWhen: isStepCount(5),
    });

    result.consumeStream();

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream,
            // originalMessages: messages,
            sendReasoning: true,
            sendSources: true,
            generateMessageId: createIdGenerator({ prefix: "msg", size:16 }),
            onEnd: async ({messages: finalMessages}) => {
                try {
                    await saveChatMessages(id, finalMessages, { updateTitle: false });
                } catch (error) {
                    console.error(error);
                }
            }
        })
    })
}
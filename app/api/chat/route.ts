import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { getChatModel } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/actions/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai"


export async function POST(req: Request) {
    await auth.protect();

    const { message, id } : { message: UIMessage, id: string } = await req.json()

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

    const SYSTEM_PROMPT = `
        You are a helpful AI assistant. 
        You are friendly, concise, and always aim to provide clear explanations.
    `

    console.log({
  conversationModel: conversation.model,
  envKey: !!process.env.OPENROUTER_API_KEY,
});

    const result = streamText({
        model: getChatModel(conversation.model),
        system: conversation.systemPrompt || SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
    });

    result.consumeStream();

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream,
            originalMessages: messages,
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
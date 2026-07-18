import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { getConversation } from "@/features/conversations/actions/conversation-action";
import { ConversationView } from "@/features/conversations/components/conversation-view";
import { notFound } from "next/navigation";

type conversationProps = {
    params: Promise<{ id: string }>
}
const page = async ({ params }: conversationProps) => {
    const { id } = await params;

    try {
        await getConversation(id)
    } catch (error) {
        notFound()
    }

    const initialMessages = await loadChatMessages(id)
    return (
        <ConversationView
        key={id}
        conversationId={id}
        initialMessages={initialMessages}
        />
    );
}

export default page
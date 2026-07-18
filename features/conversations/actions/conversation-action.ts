"use server"

import { requireUser } from "@/features/auth/actions/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export async function getConversation(conversationId: string) {
    const user = await requireUser();
    return assertOwnConversation(conversationId, user.id);
}

async function assertOwnConversation(conversatuionId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversatuionId,
            userId
        }
    })

    if(!conversation) {
        throw new Error("Conversation not found.");
    }
    return conversation
}

export async function listConversationsList(): Promise<ConversationListItem[]> {
    const user = await requireUser();

    return prisma.conversation.findMany({
        where: {
            userId: user.id,
            isArchived: false
        },
        orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true
        }
    })
}

export async function createConversation(title = 'New Chat') {
    const user = await requireUser();
    
    return prisma.conversation.create({
        data: {
            title: title.trim() || 'New Chat',
            userId: user.id
        }
    });
}

export async function deleteConverstaion(conversationId: string) {
    const user = await requireUser();
    await assertOwnConversation(conversationId, user.id);
    
    await prisma.conversation.delete({
        where: {
            id: conversationId,
        }
    });

    revalidatePath("/")
    return {
        id: conversationId
    }
}

export async function updateConversation(
    conversationId: string,
    data: { title?: string, isPinned?: boolean, isArchived?: boolean }
) {
    const user = await requireUser();
    await assertOwnConversation(conversationId, user.id);

    const conversation = await prisma.conversation.update({
        where: {
            id: conversationId
        },
        data: {
            ...(data.title && { title: data.title.trim() || 'New Chat' }),
            ...(data.isPinned && { isPinned: data.isPinned }),
            ...(data.isArchived && { isArchived: data.isArchived })
        }
    });

    revalidatePath("/")
    revalidatePath(`/c/${conversationId}`)
    return conversation
}

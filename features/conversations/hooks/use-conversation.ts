"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../utils/query-keys"
import { createConversation, deleteConverstaion, listConversationsList, updateConversation } from "../actions/conversation-action"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function useConversations() {
    return useQuery({
        queryKey: queryKeys.conversations.all,
        queryFn: () => listConversationsList()
    })
}

export function useCreateConversation() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (title?: string) => createConversation(title),
        onSuccess: (conversation) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            })
            router.push(`/c/${conversation.id}`)
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not create conversation")
        }
    })
}

export function useUpdateConversation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            ...data 
        }: {
            id: string
            title?: string
            isPinned?: boolean
            isArchived?: boolean
        }) => updateConversation(id, data),
        onSuccess: (conversation) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.detail(conversation.id),
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not update conversation")
        }
    })
}

export function useDeleteConversation(activeId?: string) {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (id: string) => deleteConverstaion(id),
        onSuccess: ({ id }) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            })
            queryClient.removeQueries({
                queryKey: queryKeys.messages.byConversation(id),
            })

            if (activeId === id) {
                void router.push("/")
            }

            toast.success("Chat deleted")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not delete conversation")
        }
    })
}
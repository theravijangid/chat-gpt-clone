import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";


export async function onBoard() {
    const clerkUser = await currentUser()

    if (!clerkUser) {
        throw new Error("User not authenticated")
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null

    return prisma.user.upsert({
        where: {
            clerkId: clerkUser.id
        },
        update: {
            email,
            firstName: clerkUser.firstName ?? undefined,
            lastName: clerkUser.lastName ?? undefined,
            imageUrl: clerkUser.imageUrl ?? undefined
        },
        create: {
            clerkId: clerkUser.id,
            email,
            firstName: clerkUser.firstName ?? undefined,
            lastName: clerkUser.lastName ?? undefined,
            imageUrl: clerkUser.imageUrl ?? undefined
        }
    })
}
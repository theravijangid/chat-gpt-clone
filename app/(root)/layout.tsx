import { onBoard } from "@/features/auth/actions/onboard";
import { ChatShell } from "@/features/conversations/components/chat-shell";
import { auth } from "@clerk/nextjs/server"

const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
  await auth.protect();
  await onBoard();
  return (
    <ChatShell>
      {children}
    </ChatShell>
  )
}

export default RootGroupLayout

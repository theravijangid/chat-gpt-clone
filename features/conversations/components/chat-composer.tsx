"use client";

import * as React from "react";
import { ArrowUpIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { BotIcon } from "lucide-react";

type ChatComposerProps = {
  onSend: (content: string, personaId?: string) => Promise<void> | void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Message input form with send button. Enter sends; Shift+Enter inserts a newline.
 */
export function ChatComposer({
  onSend,
  isSending = false,
  placeholder = "Ask Anything",
  className,
  autoFocus = false,
}: ChatComposerProps) {
  const [value, setValue] = React.useState("");
  const [personaId, setPersonaId] = React.useState("default");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  /** Submits the current message when the form is submitted or Enter is pressed. */
  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const content = value.trim();
    if (!content || isSending) return;

    setValue("");
    await onSend(content, personaId);
    textareaRef.current?.focus();
  }

  /** Handles keyboard shortcuts — Enter to send, Shift+Enter for a new line. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  const canSend = value.trim().length > 0 && !isSending;

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn("shrink-0 bg-background pt-4 mx-auto w-full max-w-4xl px-4 pb-4 md:px-6", className)}
    >
      <InputGroup className="flex-1 h-auto min-h-5 rounded-full border-border/80 bg-background shadow-sm dark:bg-input/40">
        <InputGroupAddon align="inline-start" className="pl-2 pb-2 self-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center size-9 rounded-full hover:bg-accent text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <BotIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={10} className="w-[180px]">
              <DropdownMenuRadioGroup value={personaId} onValueChange={(val) => setPersonaId(val)}>
                <DropdownMenuRadioItem value="default">Default Persona</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="hitesh">Hitesh Choudhary</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="piyush">Piyush Garg</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
        <InputGroupTextarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSending}
          rows={1}
          className="max-h-48 min-h-5 py-1 pl-4 text-[15px] leading-relaxed"
        />
        <InputGroupAddon align="inline-end" className="pr-2 pb-2 self-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            disabled={!canSend}
            className="size-9 rounded-full"
            aria-label="Send message"
          >
            {isSending ? <Spinner /> : <ArrowUpIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Masterji can make mistakes. Check important info.
      </p>
    </form>
  );
}
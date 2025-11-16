"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Clipboard, ExternalLink } from "lucide-react";

interface DocActionBarProps {
  markdown: string;
  docUrl: string;
  sourceUrl: string;
}

const OPENERS = ["github", "chatgpt", "claude", "t3", "copilot"] as const;

type OpenerId = (typeof OPENERS)[number];

type OpenerConfig = {
  id: OpenerId;
  label: string;
  buildHref: (params: {
    docUrl: string;
    prompt: string;
    sourceUrl: string;
  }) => string;
};

const openerConfigs: Record<OpenerId, OpenerConfig> = {
  github: {
    id: "github",
    label: "Open in GitHub",
    buildHref: ({ sourceUrl }) => sourceUrl,
  },
  chatgpt: {
    id: "chatgpt",
    label: "Open in ChatGPT",
    buildHref: ({ docUrl }) =>
      `https://chatgpt.com/?hints=search&prompt=${encodeURIComponent(
        `Read ${docUrl}, I want to ask questions about it.`
      )}`,
  },
  claude: {
    id: "claude",
    label: "Open in Claude",
    buildHref: ({ docUrl }) =>
      `https://claude.ai/new?q=${encodeURIComponent(
        `Read ${docUrl} and help me reason about it.`
      )}`,
  },
  t3: {
    id: "t3",
    label: "Open in T3 Chat",
    buildHref: ({ docUrl }) =>
      `https://t3.chat/?q=${encodeURIComponent(`Read ${docUrl}`)}`,
  },
  copilot: {
    id: "copilot",
    label: "Open in Copilot",
    buildHref: ({ docUrl }) =>
      `https://copilot.microsoft.com/?q=${encodeURIComponent(
        `Read ${docUrl}`
      )}`,
  },
};

export function DocActionBar({
  markdown,
  docUrl,
  sourceUrl,
}: DocActionBarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy markdown", error);
    }
  }, [markdown]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.04 mt-5">
      <p className="text-muted-foreground">
        Salin markdown atau buka panduan ini di alat favoritmu.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
          aria-label="Copy markdown"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
          {copied ? "Disalin" : "Copy Markdown"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2">
              Open in
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {OPENERS.map((id) => {
              const config = openerConfigs[id];
              const href = config.buildHref({
                docUrl,
                prompt: markdown,
                sourceUrl,
              });

              return (
                <DropdownMenuItem key={id} asChild>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-sm"
                  >
                    {config.label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

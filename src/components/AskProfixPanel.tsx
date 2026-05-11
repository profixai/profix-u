import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTier } from "@/contexts/TierContext";

const defaultPrompts = [
  "Why did our margins drop in October?",
  "What are our biggest cost drivers this quarter?",
  "How many nights were below breakeven last year?",
  "What if utility costs rise 15% next quarter?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AskProfixPanelProps {
  externalOpen?: boolean;
  onClose?: () => void;
  prefillQuestion?: string;
  contextLabel?: string;
}

export const AskProfixPanel = ({
  externalOpen,
  onClose,
  prefillQuestion,
  contextLabel,
}: AskProfixPanelProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const { hasTier } = useTier();
  const isUnlocked = hasTier("team");

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (!v && onClose) onClose();
    setInternalOpen(v);
  };

  // Handle prefilled questions
  useEffect(() => {
    if (open && prefillQuestion) {
      setInput(prefillQuestion);
    }
  }, [open, prefillQuestion]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      {
        role: "assistant",
        content: `Based on your uploaded P&L data, here's what I found regarding "${msg}":\n\nYour GOP margin in October was **33.14%**, down from **38.31%** in September. The primary drivers were a **€6,300 increase in utilities** and a seasonal dip in room revenue. I'd recommend reviewing the savings roadmap for actionable steps.`,
      },
    ]);
    setInput("");
  };

  return (
    <>
      {externalOpen === undefined && !open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-card border-l shadow-xl z-50 flex flex-col"
          >
            <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
              <div>
                <h2 className="text-sm font-semibold">Ask Profix</h2>
                <p className="text-[11px] text-muted-foreground">Answering based on PL_Q4_2024.xlsx</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {contextLabel && (
              <div className="px-4 py-2 border-b bg-muted/30">
                <Badge variant="outline" className="text-[10px]">
                  Context: {contextLabel}
                </Badge>
              </div>
            )}

            {!isUnlocked ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Ask Profix is a Team feature</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Upgrade to chat with your data — variance explanations, what-if scenarios, and natural-language drill-downs.
                </p>
                <Button
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => { setOpen(false); navigate("/upgrade"); }}
                >
                  Upgrade to Team <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ask me anything about your data:</p>
                      {defaultPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="block w-full text-left text-sm px-3 py-2 rounded-md border hover:bg-muted/50 transition-colors text-foreground"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`text-sm rounded-lg px-3 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-8"
                            : "bg-muted mr-4"
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t p-3 flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your data..."
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="text-sm"
                  />
                  <Button size="icon" onClick={() => handleSend()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

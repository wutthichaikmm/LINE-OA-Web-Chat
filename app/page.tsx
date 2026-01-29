"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User, MessageCircle } from "lucide-react";
import { Message } from "@/lib/storage";
import { format } from "date-fns";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputValue }),
      });

      if (res.ok) {
        setInputValue("");
        fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-primary">
            <MessageCircle className="w-6 h-6 text-green-500" />
            LINE OA Web Chat
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Messages will be sent to the last LINE user who messaged the bot.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 bg-white dark:bg-slate-900/50">
          <ScrollArea className="h-full p-6">
            <div className="flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No messages yet. Send a message from your LINE account to start.
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      {msg.sender === "line" ? (
                        <MessageCircle className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {msg.sender === "line" ? "LINE User" : "Admin"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className="text-[10px] opacity-60 mt-1 block text-right">
                      {format(new Date(msg.timestamp), "HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={handleSendMessage}
            className="flex w-full items-center gap-2"
          >
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

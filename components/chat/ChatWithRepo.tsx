"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  FileText,
  Loader2,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RepoContent {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: RepoContent[];
  content?: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatWithRepoProps {
  allFiles: RepoContent[];
  owner: string | null;
  repoName: string | null;
  fileContent: string;
}

export default function ChatWithRepo({
  allFiles,
  repoName,
  fileContent,
}: ChatWithRepoProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: `Hello! I'm here to help you understand the ${repoName} repository. You can ask me about the code structure, specific files, or any questions about the codebase.`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: input.trim(),
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);

      try {
        const response = await fetch("https://chat-git.vercel.app/api/chat", {
        // const response = await fetch("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: input.trim(),
            fileContent: fileContent,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const botMessage: Message = {
          id: Date.now(),
          text:
            formatBotResponse(data.output) || "I couldn't generate a response.",
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Chat error:", error);

        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, there was an error processing your request. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setInput("");
      }
    }
  };

  const formatBotResponse = (response: string): string => {
    const lines = response.split("\n");
    return lines
      .map((line) => {
        if (line.startsWith("*")) {
          return `<li>${line.slice(1).trim()}</li>`;
        }
        if (line.startsWith("**")) {
          return `<b>${line.slice(2).trim()}</b>`;
        }
        return `<p>${line.trim()}</p>`;
      })
      .join("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderFileTree = (files: RepoContent[], level = 0) => {
    return (
      <ul className={`pl-${level * 4} space-y-1`}>
        {files.map((file) => (
          <li key={file.path} className="py-1">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-lg">
                {file.type === "dir" ? "📁" : "📄"}
              </span>
              <span className="text-slate-300">{file.name}</span>
              <Badge variant="outline" className="text-xs">
                {file.type}
              </Badge>
            </div>
            {file.children && renderFileTree(file.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="h-[580px] flex flex-col bg-gray-800 text-white rounded-md">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Chat with {repoName}</span>
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-900 font-bold text-sm"
              >
                <FileText className="h-4 w-4 mr-1" />
                Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Repository Structure</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[500px] w-full">
                <div className="p-4">{renderFileTree(allFiles)}</div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.sender === "user"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }
                  >
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    }`}
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                  <div
                    className={`text-xs text-slate-500 mt-1 ${
                      message.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100 text-green-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the repository..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

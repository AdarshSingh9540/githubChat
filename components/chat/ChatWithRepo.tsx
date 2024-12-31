'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, FileText, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface RepoContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: RepoContent[];
  content?: string;
}

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

interface ChatWithRepoProps {
  allFiles: RepoContent[]
  owner: string | null
  repoName: string | null
  fileContent: string 
}

export default function ChatWithRepo({ allFiles, repoName, fileContent }: ChatWithRepoProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: input.trim(),
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);
  
      setIsLoading(true);
  
      try {
        const response = await fetch('https://chat-git.vercel.app/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: input.trim(),
            fileContent: fileContent,  
          }),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        const botMessage: Message = {
          id: Date.now(),
          text: formatBotResponse(data.output) || "I couldn't generate a response.",
          sender: 'bot',
        };
  
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Chat error:', error);
  
        const errorMessage: Message = {
          id: Date.now(),
          text: "Sorry, there was an error processing your request.",
          sender: 'bot',
        };
  
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }
  };
  
  const formatBotResponse = (response: string): string => {
    const lines = response.split('\n');
    return lines.map(line => {
      if (line.startsWith('*')) {
        return `<li>${line.slice(1).trim()}</li>`;
      }
      if (line.startsWith('**')) {
        return `<b>${line.slice(2).trim()}</b>`;
      }
      return `<p>${line.trim()}</p>`;
    }).join('');
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const renderFileTree = (files: RepoContent[], level = 0) => {
    return (
      <ul className={`pl-${level * 4}`}>
        {files.map((file) => (
          <li key={file.path} className="py-1">
            <div className="flex items-center ">
              {file.type === 'dir' ? '📁' : '📄'}
              <span className="ml-2 ">{file.name}</span>
            </div>
            {file.children && renderFileTree(file.children, level + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col h-[650px] w-full bg-gray-800 text-white rounded-md">
      <div className="p-4 bg-gray-700 flex justify-between items-center rounded-lg">
        <h2 className="text-xl font-bold">Chat with {repoName} Repository</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <FileText className="h-4 w-4 text-black" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Repository Files</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] w-full">
              {renderFileTree(allFiles)}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-2 rounded-lg max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-white'
              }`}
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-center my-2 text-white">
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </div>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 bg-gray-700 flex">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your repository..."
          disabled={isLoading}
          className="flex-grow mr-2 bg-gray-600 text-white disabled:opacity-50"
        />
        <Button 
          onClick={handleSend} 
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

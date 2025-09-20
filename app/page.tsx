'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Zap, 
  Globe, 
  Calculator, 
  Languages, 
  CloudSun,
  FileText,
  Activity,
  Trash2,
  Paperclip,
  AlertCircle,
  Loader2,
  MessageSquare,
  Database,
} from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatResponse {
  response: string;
  thread_id: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState('default-1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: input, thread_id: threadId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setThreadId(data.thread_id);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickPrompts = [
    { icon: Calculator, label: 'Calculate', prompt: 'Calculate the compound interest on $10,000 at 5% for 3 years' },
    { icon: CloudSun, label: 'Weather', prompt: "What's the weather forecast for New York this week?" },
    { icon: Languages, label: 'Convert', prompt: 'Convert 100 USD to EUR at current exchange rates' },
    { icon: FileText, label: 'Research', prompt: 'Explain quantum computing in simple terms' },
  ];

  const availableTools = [
    { name: 'Calculator', icon: Calculator, status: 'active' },
    { name: 'Web Search', icon: Globe, status: 'active' },
    { name: 'Translation', icon: Languages, status: 'active' },
    { name: 'Weather API', icon: CloudSun, status: 'active' },
    { name: 'Document Analysis', icon: FileText, status: 'active' },
    { name: 'Unit Converter', icon: Activity, status: 'active' },
    { name: 'Knowledge Base', icon: Database, status: 'active' },
  ];

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    LA
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">LangGraph Assistant</CardTitle>
                  <CardDescription>Powered by Azure OpenAI</CardDescription>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2">
                <Badge variant="outline" className="gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  Connected
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  Thread: {threadId.slice(0, 8)}...
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Sidebar */}
        <Card className="hidden lg:block w-72">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Available Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {availableTools.map((tool, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <tool.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{tool.name}</span>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-3 text-sm">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Messages</span>
                  <Badge variant="secondary">{messages.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4 pb-4">
              {messages.length === 0 && (
                <Card className="mx-auto max-w-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="mb-8">
                      <Avatar className="h-16 w-16 mx-auto mb-4">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <MessageSquare className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-2xl mb-2">Welcome to LangGraph Assistant</CardTitle>
                      <CardDescription className="text-base">
                        Your intelligent AI assistant with multi-tool capabilities. Ask me anything or try one of the quick prompts below.
                      </CardDescription>
                    </div>
                    
                    {/* Quick Prompts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {quickPrompts.map((prompt, i) => (
                        <Card
                          key={i}
                          className="cursor-pointer hover:bg-accent transition-colors border-dashed"
                          onClick={() => setInput(prompt.prompt)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-md bg-primary/10">
                                <prompt.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-left flex-1">
                                <p className="font-medium text-sm mb-1">{prompt.label}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {prompt.prompt}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      {['GPT-4', 'Real-time', 'Secure', 'Multi-tool'].map((feature) => (
                        <Badge key={feature} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <Card className={`${msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-3">
                        <div className="whitespace-pre-wrap text-sm">
                          {msg.content}
                        </div>
                      </CardContent>
                    </Card>
                    {msg.timestamp && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 bg-background">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative min-w-0">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline ml-2">
                  {isLoading ? 'Sending...' : 'Send'}
                </span>
              </Button>
            </form>

            {/* Mobile Status */}
            <div className="mt-3 flex lg:hidden justify-between items-center max-w-4xl mx-auto">
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Connected
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                Thread: {threadId.slice(0, 8)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
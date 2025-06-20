import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { cn, getBackendUrl } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: '您好！我是您的智能問答助理，有什麼可以為您服務的嗎？',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { 
      sender: 'user', 
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${getBackendUrl()}/api/rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botResponse: Message = { 
        sender: 'bot', 
        text: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = { 
        sender: 'bot', 
        text: '抱歉，我暫時無法回應，請稍後再試。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)]">
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle>智能問答</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn("flex", msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex items-center gap-2 w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="請輸入您的問題..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chatbot;

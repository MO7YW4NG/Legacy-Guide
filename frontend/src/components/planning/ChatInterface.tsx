import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Video, VideoOff, Mic, MicOff } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好，我是智能助理。我可以幫助您規劃喪禮流程，請問有什麼可以為您服務的嗎？',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模擬AI說話動畫
  useState(() => {
    if (isVideoOn) {
      const interval = setInterval(() => {
        setIsAISpeaking(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  });

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/chat/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage })
        });
        if (!res.ok) throw new Error('AI 回覆失敗');
        const data = await res.json();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.answer,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } catch (e) {
        setError('AI 回覆失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // 這裡可以添加語音識別功能
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground font-light text-lg">智能問答助理</CardTitle>
          <Button
            variant={isVideoOn ? "default" : "outline"}
            size="sm"
            onClick={toggleVideo}
            className="flex items-center gap-2"
          >
            {isVideoOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {isVideoOn ? '關閉視訊' : '開啟視訊'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* 視訊區域 */}
        {isVideoOn && (
          <div className="border-b border-border p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            <div className="text-center">
              <Avatar className={`w-32 h-32 mx-auto mb-4 transition-all duration-300 ${
                isAISpeaking ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'scale-100'
              }`}>
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
                  AI
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-medium text-gray-800 mb-2">智能助理小瑜</h3>
              <p className="text-sm text-gray-600 mb-4">
                {isAISpeaking ? '正在回答您的問題...' : '您好，我是您的專屬助理'}
              </p>
              
              {/* 語音波形動畫 */}
              {isAISpeaking && (
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* 狀態指示器 */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-xs font-medium">視訊通話中</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 聊天記錄 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm font-light">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.isUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      您
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* 輸入區域 */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的問題..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button onClick={handleSendMessage} size="icon" disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </Card>
  );
};

export default ChatInterface;

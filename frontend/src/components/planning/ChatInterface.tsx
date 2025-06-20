import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Video, VideoOff, Mic, MicOff, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, getBackendUrl } from "@/lib/utils";
import { ParsedFormData, Message } from "@/types";

interface ChatInterfaceProps {
  onParsedDataUpdate?: (data: ParsedFormData) => void;
  initialMessages?: Message[];
  initialConversationHistory?: string;
  onMessagesUpdate?: (messages: Message[]) => void;
  onConversationHistoryUpdate?: (history: string) => void;
}

const ChatInterface = ({ 
  onParsedDataUpdate,
  initialMessages,
  initialConversationHistory,
  onMessagesUpdate,
  onConversationHistoryUpdate
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: '1',
        content: '您好，我是智能助理。我可以幫助您規劃喪禮流程，請問有什麼可以為您服務的嗎？',
        isUser: false,
        timestamp: new Date()
      }
    ]
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string>(
    initialConversationHistory || ''
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 當消息更新時通知父組件
  useEffect(() => {
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  // 當對話歷史更新時通知父組件
  useEffect(() => {
    if (onConversationHistoryUpdate) {
      onConversationHistoryUpdate(conversationHistory);
    }
  }, [conversationHistory, onConversationHistoryUpdate]);

  useEffect(() => {
    const videoElement = videoRef.current;

    // Function to set up audio analysis
    const setupAudioAnalysis = () => {
      if (!videoElement) return;

      if (!audioContextRef.current) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
        analyserRef.current = context.createAnalyser();
        analyserRef.current.fftSize = 32;
        sourceRef.current = context.createMediaElementSource(videoElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(context.destination);
      }
    };

    // Function to start waveform animation
    const startAnimation = () => {
      if (!analyserRef.current) return;
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const animate = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
          animationFrameIdRef.current = requestAnimationFrame(animate);
        }
      };
      animate();
    };

    // Function to stop waveform animation
    const stopAnimation = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      setAudioData(null);
    };
    
    if (showVideo && videoElement) {
      setupAudioAnalysis();
      videoElement.addEventListener('play', startAnimation);
      videoElement.addEventListener('pause', stopAnimation);
      videoElement.addEventListener('ended', stopAnimation);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', startAnimation);
        videoElement.removeEventListener('pause', stopAnimation);
        videoElement.removeEventListener('ended', stopAnimation);
      }
      stopAnimation();
    };
  }, [showVideo]);

  // Cleanup AudioContext on component unmount
  useEffect(() => {
    return () => {
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      audioContextRef.current?.close().catch(e => console.error("Failed to close AudioContext", e));
    };
  }, []);

  // Parse conversation after each message
  const parseConversation = (newMessage: string) => {
    const updatedConversation = conversationHistory + '\n' + newMessage;
    setConversationHistory(updatedConversation);

    // Run in background without blocking UI
    fetch(`${getBackendUrl()}/api/parse-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_text: updatedConversation })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Parse conversation failed');
    })
    .then(result => {
      if (result.success && result.parsed_data && onParsedDataUpdate) {
        onParsedDataUpdate(result.parsed_data);
      }
    })
    .catch(error => {
      console.error('Error parsing conversation:', error);
    });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !loading) {
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

      // Parse conversation with user message (background)
      parseConversation(`用戶：${inputMessage}`);

      try {
        const res = await fetch(`${getBackendUrl()}/api/rag2`, {
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

        // Parse conversation with AI response (background)
        parseConversation(`AI：${data.answer}`);
      } catch (e) {
        setError('AI 回覆失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      // This is when user STOPS recording
      setIsRecording(false);
      setLoading(true);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        content: '我的預算大概是十萬元，請問你們能提供哪些方案？',
        isUser: true,
        timestamp: new Date(),
      };
      setTimeout(() => {
        setMessages(prev => [...prev, userMessage]);
      }, 1500);
  
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '您好，根據您十萬元的預算，最適合您的方案是 **「圓愛生前契約」**。\n\n*   **定價：** 8 萬元\n*   **特色：** 高度彈性\n\n這個方案已包含臨終關懷、遺體接運、設立靈堂等核心服務。\n\n剩下的預算，您可以像「菜單點餐」一樣，自由加購您最重視的項目，例如「入殮」或「火化」，來打造一個符合您預算的客製化方案。\n\n我會協助您搭配組合，確保在預算內為父親辦理一場莊重圓滿的告別式。',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setShowVideo(true);
        if (!isVideoOn) {
          setIsVideoOn(true);
        }
  
        setLoading(false);
      }, 3000);
  
    } else {
      // This is when user STARTS recording
      setIsRecording(true);
      setShowVideo(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground font-light text-lg">智能問答助理</CardTitle>
          <Button
            variant={isVideoOn ? "default" : "outline"}
            size="sm"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="flex items-center gap-2"
          >
            {isVideoOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {isVideoOn ? '關閉視訊' : '開啟視訊'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {isVideoOn && (
          <div className="border-b border-border p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            <div className="text-center">
              <Avatar className={`w-32 h-32 mx-auto mb-4 transition-all duration-300 ${
                audioData ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'scale-100'
              }`}>
                {showVideo ? (
                  <video
                    ref={videoRef}
                    // In Vite, files in the `public` directory are served from the root.
                    src="/video.mp4"
                    autoPlay
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
                    AI
                  </AvatarFallback>
                )}
              </Avatar>
              <h3 className="text-lg font-medium text-gray-800 mb-2">智能助理小瑜</h3>
              
              {/* 語音波形動畫 */}
              {audioData && (
                <div className="flex justify-center items-end gap-1 mb-4 h-6">
                  {Array.from(audioData).map((value, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-400 rounded-full"
                      style={{
                        height: `${Math.max(2, (value / 255) * 24)}px`,
                        transition: 'height 0.05s ease-out'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 p-4">
          <ScrollArea className="h-full" type="always">
            <div className="space-y-4 pr-4">
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
                    <div className="text-sm font-light prose dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
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
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="輸入您的問題..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRecordingToggle}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
              disabled={loading}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={handleSendMessage} 
              size="icon" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {error && (
            <div className="text-red-500 text-xs mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;

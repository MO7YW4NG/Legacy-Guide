
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, Phone, Send, MessageSquare } from "lucide-react";

interface VideoInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoInterface = ({ isOpen, onClose }: VideoInterfaceProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  // 模擬AI說話動畫
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setIsAISpeaking(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // 這裡可以處理發送消息的邏輯
      setChatInput("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-full p-0 bg-black">
        {/* 抖音直播風格的全屏視訊界面 */}
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* 虛擬人視訊區域 */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Avatar className={`w-64 h-64 mx-auto mb-6 transition-all duration-300 ${
                isAISpeaking ? 'ring-8 ring-blue-400 ring-opacity-50 scale-105' : 'scale-100'
              }`}>
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-6xl">
                  AI
                </AvatarFallback>
              </Avatar>
              <h2 className="text-3xl font-bold text-white mb-4">智能助理小瑜</h2>
              <p className="text-xl text-blue-200 mb-6">
                {isAISpeaking ? '正在回答您的問題...' : '您好，我是您的專屬助理'}
              </p>
              
              {/* 語音波形動畫 */}
              {isAISpeaking && (
                <div className="flex justify-center gap-2 mb-8">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-blue-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 20}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側聊天面板 */}
          {showChat && (
            <div className="absolute right-0 top-0 h-full w-80 bg-black/80 backdrop-blur-sm border-l border-white/20">
              <div className="p-4 h-full flex flex-col">
                <h3 className="text-white font-medium mb-4">即時問答</h3>
                <div className="flex-1 mb-4">
                  {/* 聊天記錄區域 */}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="輸入您的問題..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 底部控制欄 */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowChat(!showChat)}
              className="rounded-full w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={onClose}
              className="rounded-full w-14 h-14"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>

          {/* 頂部狀態指示器 */}
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">直播中</span>
            </div>
            <div className="bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm">智能助理服務</span>
            </div>
          </div>

          {/* 右上角關閉按鈕 */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute top-8 right-8 text-white hover:bg-white/20 rounded-full w-10 h-10"
          >
            ✕
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoInterface;

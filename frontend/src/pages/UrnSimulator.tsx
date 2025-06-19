
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Download, RotateCcw } from "lucide-react";

const UrnSimulator = () => {
  const [selectedUrn, setSelectedUrn] = useState("classic");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [memorialText, setMemorialText] = useState("");

  const urnStyles = [
    {
      id: "classic",
      name: "經典款",
      description: "傳統莊重設計",
      color: "bg-gradient-to-b from-amber-100 to-amber-200",
      preview: "🏺"
    },
    {
      id: "modern",
      name: "現代款",
      description: "簡約時尚設計",
      color: "bg-gradient-to-b from-gray-100 to-gray-200",
      preview: "⚱️"
    },
    {
      id: "elegant",
      name: "優雅款",
      description: "精緻花紋設計",
      color: "bg-gradient-to-b from-blue-100 to-blue-200",
      preview: "🏛️"
    },
    {
      id: "natural",
      name: "自然款",
      description: "木紋質感設計",
      color: "bg-gradient-to-b from-yellow-100 to-orange-200",
      preview: "🌳"
    }
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPhoto = () => {
    setUploadedPhoto(null);
  };

  const selectedUrnStyle = urnStyles.find(urn => urn.id === selectedUrn);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-light text-foreground mb-2">骨灰罈模擬器</h1>
        <p className="text-muted-foreground">選擇合適的骨灰罈樣式，並上傳照片預覽效果</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：樣式選擇 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-light">選擇骨灰罈樣式</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {urnStyles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedUrn(style.id)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedUrn === style.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-16 rounded-lg ${style.color} flex items-center justify-center text-2xl shadow-sm`}>
                      {style.preview}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{style.name}</h3>
                      <p className="text-sm text-muted-foreground">{style.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 照片上傳 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-light">上傳照片</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">點擊上傳照片</p>
                    <p className="text-xs text-muted-foreground">支援 JPG, PNG 格式</p>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </Label>
              </div>

              {uploadedPhoto && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">照片已上傳</span>
                  <Button variant="outline" size="sm" onClick={resetPhoto}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重新上傳
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 紀念文字輸入 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-light">紀念文字</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="memorial-text">刻印文字</Label>
              <Input
                id="memorial-text"
                value={memorialText}
                onChange={(e) => setMemorialText(e.target.value)}
                placeholder="請輸入想要刻印的紀念文字"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground mt-1">
                最多20個字符 ({memorialText.length}/20)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 右側：預覽效果 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-light">預覽效果</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-96">
              <div className="relative">
                {/* 骨灰罈 */}
                <div className={`w-48 h-64 rounded-t-full rounded-b-lg ${selectedUrnStyle?.color} shadow-xl relative overflow-hidden`}>
                  {/* 骨灰罈裝飾 */}
                  <div className="absolute inset-2 border border-black/10 rounded-t-full rounded-b-lg"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-6 bg-black/10 rounded-full"></div>
                  </div>
                  
                  {/* 照片顯示區域 */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-white rounded-lg shadow-inner flex items-center justify-center border">
                    {uploadedPhoto ? (
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={uploadedPhoto} alt="上傳的照片" className="object-cover" />
                        <AvatarFallback>照片</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                          📷
                        </div>
                        <p className="text-xs">照片位置</p>
                      </div>
                    )}
                  </div>

                  {/* 文字區域 */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="bg-white/80 px-3 py-1 rounded text-xs text-gray-700 max-w-32">
                      {memorialText || "紀念文字"}
                    </div>
                  </div>
                </div>

                {/* 底座 */}
                <div className={`w-56 h-8 ${selectedUrnStyle?.color} rounded-full shadow-lg -mt-2 mx-auto opacity-80`}></div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按鈕 */}
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              下載預覽圖
            </Button>
            <Button className="bg-vi-dark hover:opacity-90">
              確認選擇
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrnSimulator;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Loader2, Upload, X, Image, Calendar as CalendarIcon } from "lucide-react";
import { getBackendUrl, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface UrnTemplate {
  filename: string;
  name: string;
  url: string;
}

interface UrnFormData {
  deceased_name: string;
  birth_date: string;
  death_date: string;
  urn_photo_filename: string;
}

const UrnSimulator = () => {
  const { toast } = useToast();
  const [urnTemplates, setUrnTemplates] = useState<UrnTemplate[]>([]);
  const [selectedUrn, setSelectedUrn] = useState<string>("");
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedDesignBase64, setGeneratedDesignBase64] = useState<string | null>(null);
  const [formData, setFormData] = useState<UrnFormData>({
    deceased_name: "",
    birth_date: "",
    death_date: "",
    urn_photo_filename: ""
  });

  // 載入骨灰罈樣式
  useEffect(() => {
    fetchUrnTemplates();
  }, []);

  const fetchUrnTemplates = async () => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/urn-templates`);
      if (response.ok) {
        const data = await response.json();
        setUrnTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedUrn(data.templates[0].filename);
          setFormData(prev => ({ ...prev, urn_photo_filename: data.templates[0].filename }));
        }
      }
    } catch (error) {
      console.error('Error fetching urn templates:', error);
      toast({
        title: "錯誤",
        description: "無法載入骨灰罈樣式",
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPhoto = () => {
    setUploadedPhoto(null);
    setPhotoPreview(null);
  };

  const handleInputChange = (field: keyof Omit<UrnFormData, 'birth_date' | 'death_date'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'birth_date' | 'death_date', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date ? format(date, 'yyyy/MM/dd') : '' }));
  };

  const handleUrnSelect = (filename: string) => {
    setSelectedUrn(filename);
    setFormData(prev => ({ ...prev, urn_photo_filename: filename }));
  };

  const generateUrnDesign = async () => {
    if (!uploadedPhoto || !selectedUrn) {
      toast({
        title: "錯誤",
        description: "請選擇骨灰罈樣式並上傳照片",
        variant: "destructive"
      });
      return;
    }

    if (!formData.deceased_name || !formData.birth_date || !formData.death_date) {
      toast({
        title: "錯誤",
        description: "請填寫完整的資料",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('deceased_name', formData.deceased_name);
      formDataToSend.append('birth_date', formData.birth_date);
      formDataToSend.append('death_date', formData.death_date);
      formDataToSend.append('urn_photo_filename', formData.urn_photo_filename);
      formDataToSend.append('portrait_photo', uploadedPhoto);

      const response = await fetch(`${getBackendUrl()}/api/urns`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedDesignBase64(result.data.design_image_base64);
        
        toast({
          title: "成功",
          description: "骨灰罈模擬圖已生成",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '生成失敗');
      }
    } catch (error) {
      console.error('Error generating urn design:', error);
      toast({
        title: "錯誤",
        description: error instanceof Error ? error.message : "生成骨灰罈設計失敗",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDesign = async () => {
    if (generatedDesignBase64 && !isDownloading) {
      setIsDownloading(true);
      try {
        // 將 base64 轉換為 blob
        const byteCharacters = atob(generatedDesignBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${formData.deceased_name || 'design'}_骨灰罈設計.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading the design:', error);
        toast({
          title: "下載失敗",
          description: "無法下載設計圖，請稍後再試。",
          variant: "destructive",
        });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const selectedUrnTemplate = urnTemplates.find(urn => urn.filename === selectedUrn);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">骨灰罈模擬器</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          透過選擇樣式與填寫資料，即時預覽個人化的骨灰罈設計。
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Settings */}
          <div className="p-6 border-r">
            <Tabs defaultValue="style">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="style">樣式與照片</TabsTrigger>
                <TabsTrigger value="data">資料填寫</TabsTrigger>
              </TabsList>
              <TabsContent value="style" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">選擇樣式</h3>
                    <ScrollArea className="h-72 w-full">
                      <div className="space-y-2 pr-4">
                        {urnTemplates.map((urn) => (
                          <div
                            key={urn.filename}
                            className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${selectedUrn === urn.filename ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                            onClick={() => handleUrnSelect(urn.filename)}
                          >
                            <img src={`${getBackendUrl()}${urn.url}`} alt={urn.name} className="w-16 h-16 rounded-md object-cover" />
                            <div>
                              <p className="font-semibold">{urn.name}</p>
                              <p className="text-sm text-muted-foreground">骨灰罈樣式</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">上傳遺照</h3>
                    {photoPreview ? (
                      <div className="relative group w-40 h-40">
                        <Avatar className="w-full h-full rounded-lg shadow-md">
                          <AvatarImage src={photoPreview} alt="Uploaded Photo" className="object-cover" />
                          <AvatarFallback>照片</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <Button variant="destructive" size="icon" onClick={resetPhoto}>
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center">
                        <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-2">點擊或拖曳檔案至此</p>
                        <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        <Button asChild variant="outline">
                          <Label htmlFor="photo-upload">選擇檔案</Label>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="data" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deceased_name">逝者姓名</Label>
                    <Input id="deceased_name" value={formData.deceased_name} onChange={(e) => handleInputChange('deceased_name', e.target.value)} />
                  </div>
                  <div>
                    <Label>出生日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.birth_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.birth_date ? (
                            format(new Date(formData.birth_date), "yyyy年MM月dd日")
                          ) : (
                            <span>請選擇日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.birth_date ? new Date(formData.birth_date) : undefined}
                          onSelect={(date) => handleDateChange('birth_date', date)}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>逝世日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.death_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.death_date ? (
                            format(new Date(formData.death_date), "yyyy年MM月dd日")
                          ) : (
                            <span>請選擇日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.death_date ? new Date(formData.death_date) : undefined}
                          onSelect={(date) => handleDateChange('death_date', date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Preview and Actions */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-medium mb-3">預覽效果</h3>
              <div className="aspect-square bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center">
                {generatedDesignBase64 ? (
                  <img src={`data:image/png;base64,${generatedDesignBase64}`} alt="生成的骨灰罈設計" className="w-full h-full object-contain" />
                ) : selectedUrnTemplate ? (
                  <img src={`${getBackendUrl()}${selectedUrnTemplate.url}`} alt={selectedUrnTemplate.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-muted-foreground text-center p-4">
                    <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>請在左側選擇骨灰罈樣式</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              {generatedDesignBase64 ? (
                <>
                  <Button variant="outline" className="flex items-center gap-2" onClick={downloadDesign} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isDownloading ? "下載中..." : "下載設計圖"}
                  </Button>
                  <Button variant="outline" onClick={() => setGeneratedDesignBase64(null)} disabled={isDownloading}>
                    重新設計
                  </Button>
                </>
              ) : (
                <Button className="w-full bg-vi-dark hover:opacity-90" onClick={generateUrnDesign} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      生成中...
                    </>
                  ) : (
                    "生成設計"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UrnSimulator;

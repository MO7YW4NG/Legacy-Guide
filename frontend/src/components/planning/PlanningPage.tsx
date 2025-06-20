import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatInterface from "./ChatInterface";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

interface ParsedFormData {
  deceased_name: string;
  gender: string;
  birth_date: string;
  death_date: string;
  zodiac: string;
  clash_info: string;
  location: string;
  venue_recommendation: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  religion: string;
  budget_min: number;
  budget_max: number;
  budget_range: string;
  completion_days: string;
  recommended_plan: string;
  special_requirements: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const PlanningPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [parsedData, setParsedData] = useState<ParsedFormData | undefined>();
  const [formData, setFormData] = useState({
    // Step One - 往生者基本資料
    deceasedName: "",
    gender: "",
    birthDate: null as Date | null,
    deathDate: null as Date | null,
    zodiac: "",
    cityOfResidence: "",
    
    // Step Two - 聯絡人資訊
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    religion: "",
    familyZodiacs: [] as string[],
    
    // Step Three - 預算與需求
    budget: 100000,
    expectedDays: 7,
    specialRequirements: ""
  });

  // 保存聊天狀態
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好，我是智能助理。我可以幫助您規劃喪禮流程，請問有什麼可以為您服務的嗎？',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [conversationHistory, setConversationHistory] = useState<string>('');

  const handleParsedDataUpdate = (data: ParsedFormData) => {
    setParsedData(data);
    
    // Auto-fill form data from parsed conversation
    const updatedFormData = { ...formData };
    let hasChanges = false;

    if (data.deceased_name && !formData.deceasedName) {
      updatedFormData.deceasedName = data.deceased_name;
      hasChanges = true;
    }
    if (data.gender && !formData.gender) {
      updatedFormData.gender = data.gender === "男" ? "male" : "female";
      hasChanges = true;
    }
    if (data.birth_date && !formData.birthDate) {
      updatedFormData.birthDate = new Date(data.birth_date);
      hasChanges = true;
    }
    if (data.death_date && !formData.deathDate) {
      updatedFormData.deathDate = new Date(data.death_date);
      hasChanges = true;
    }
    if (data.zodiac && !formData.zodiac) {
      updatedFormData.zodiac = data.zodiac;
      hasChanges = true;
    }
    if (data.location && !formData.cityOfResidence) {
      updatedFormData.cityOfResidence = data.location;
      hasChanges = true;
    }
    if (data.contact_name && !formData.contactName) {
      updatedFormData.contactName = data.contact_name;
      hasChanges = true;
    }
    if (data.contact_phone && !formData.contactPhone) {
      updatedFormData.contactPhone = data.contact_phone;
      hasChanges = true;
    }
    if (data.contact_email && !formData.contactEmail) {
      updatedFormData.contactEmail = data.contact_email;
      hasChanges = true;
    }
    if (data.religion && !formData.religion) {
      updatedFormData.religion = data.religion;
      hasChanges = true;
    }
    // 處理家屬生肖數據（如果有的話）
    if (data.clash_info && !formData.familyZodiacs.length) {
      // 從沖煞信息中提取生肖（這裡可以根據實際需求調整邏輯）
      const zodiacMatch = data.clash_info.match(/[鼠牛虎兔龍蛇馬羊猴雞狗豬]/g);
      if (zodiacMatch) {
        updatedFormData.familyZodiacs = [...new Set(zodiacMatch)]; // 去重
        hasChanges = true;
      }
    }
    if (data.budget_range && !formData.budget) {
      // Convert budget range to number
      const budgetMatch = data.budget_range.match(/(\d+)/);
      if (budgetMatch) {
        updatedFormData.budget = parseInt(budgetMatch[1]) * 1000;
        hasChanges = true;
      }
    }
    if (data.completion_days && !formData.expectedDays) {
      updatedFormData.expectedDays = parseInt(data.completion_days);
      hasChanges = true;
    }
    if (data.special_requirements && !formData.specialRequirements) {
      updatedFormData.specialRequirements = data.special_requirements;
      hasChanges = true;
    }

    if (hasChanges) {
      setFormData(updatedFormData);
    }
  };

  // 處理聊天消息更新
  const handleChatMessagesUpdate = (messages: Message[]) => {
    setChatMessages(messages);
  };

  // 處理對話歷史更新
  const handleConversationHistoryUpdate = (history: string) => {
    setConversationHistory(history);
  };

  const handleInputChange = (field: string, value: string | number | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne formData={formData} onInputChange={handleInputChange} />;
      case 2:
        return <StepTwo formData={formData} onInputChange={handleInputChange} />;
      case 3:
        return <StepThree formData={formData} onInputChange={handleInputChange} />;
      default:
        return <StepOne formData={formData} onInputChange={handleInputChange} />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">喪禮規劃系統</h1>
        <p className="text-muted-foreground">
          透過智能對話來規劃喪禮流程，右側可即時查看和編輯表單
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
        <ChatInterface 
          onParsedDataUpdate={handleParsedDataUpdate}
          initialMessages={chatMessages}
          initialConversationHistory={conversationHistory}
          onMessagesUpdate={handleChatMessagesUpdate}
          onConversationHistoryUpdate={handleConversationHistoryUpdate}
        />
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>規劃表單</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {renderStep()}
          </CardContent>
          <div className="flex-shrink-0 p-6 border-t">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={currentStep === 3}
              >
                下一步
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlanningPage; 
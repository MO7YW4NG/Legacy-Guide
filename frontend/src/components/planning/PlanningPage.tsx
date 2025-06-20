import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatInterface from "./ChatInterface";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { ParsedFormData, Message } from "@/types";

const PlanningPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step One - 往生者基本資料
    deceasedName: "",
    gender: "",
    birthDate: null as Date | null,
    deathDate: null as Date | null,
    zodiac: "",
    city: "",
    
    // Step Two - 聯絡人資訊
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    religion: "",
    familyZodiacs: [] as string[],
    
    // Step Three - 預算與需求
    budget: 100000,
    completion_weeks: 7,
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
    // Auto-fill form data from parsed conversation
    setFormData(prev => {
      const updated = { ...prev };
      if (data.deceased_name) updated.deceasedName = data.deceased_name;
      if (data.gender) updated.gender = data.gender === "男" ? "male" : "female";
      if (data.birth_date) updated.birthDate = new Date(data.birth_date);
      if (data.death_date) updated.deathDate = new Date(data.death_date);
      if (data.zodiac) updated.zodiac = data.zodiac;
      if (data.city) updated.city = data.city;
      if (data.contact_name) updated.contactName = data.contact_name;
      if (data.contact_phone) updated.contactPhone = data.contact_phone;
      if (data.contact_email) updated.contactEmail = data.contact_email;
      if (data.religion) updated.religion = data.religion;
      if (data.family_zodiacs && data.family_zodiacs.length > 0) {
        updated.familyZodiacs = data.family_zodiacs;
      }
      if (data.budget > 0) {
        updated.budget = data.budget; 
      }
      if (data.completion_weeks > 0) {
        updated.completion_weeks = data.completion_weeks;
      }
      if (data.special_requirements) {
        updated.specialRequirements = data.special_requirements;
      }
      return updated;
    });
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

  const completePlanning = () => {
    navigate('/overview', { state: { formData } });
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
              
              {currentStep === 3 ? (
                <Button onClick={completePlanning}>
                  完成規劃
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  下一步
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlanningPage; 
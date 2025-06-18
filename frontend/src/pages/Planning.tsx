
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StepOne from "@/components/planning/StepOne";
import StepTwo from "@/components/planning/StepTwo";
import StepThree from "@/components/planning/StepThree";
import ChatInterface from "@/components/planning/ChatInterface";

const Planning = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // 步驟一：亡者基本資料
    deceasedName: "",
    gender: "",
    zodiac: "",
    deathDate: new Date(),
    birthDate: undefined as Date | undefined,
    cityOfResidence: "",
    
    // 步驟二：家屬資訊
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    religion: "",
    
    // 步驟三：服務需求
    budget: 50000,
    expectedDays: 7,
    specialRequirements: ""
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "亡者基本資料",
    "家屬資訊",
    "服務需求"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // 最後一步，跳轉到總覽頁面
      navigate('/overview', { state: { formData } });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne formData={formData} onInputChange={handleInputChange} />;
      case 2:
        return <StepTwo formData={formData} onInputChange={handleInputChange} />;
      case 3:
        return <StepThree formData={formData} onInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* 左側：問答介面 */}
      <div className="lg:col-span-1">
        <ChatInterface />
      </div>

      {/* 右側：原流程規劃介面 */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              步驟 {currentStep}: {stepTitles[currentStep - 1]}
            </CardTitle>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {currentStep} / {totalSteps}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderCurrentStep()}

            {/* 導航按鈕 */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                上一步
              </Button>

              <Button
                onClick={handleNext}
                className="bg-vi-dark hover:opacity-90 text-primary-foreground flex items-center"
              >
                {currentStep === totalSteps ? "完成規劃" : "下一步"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Planning;

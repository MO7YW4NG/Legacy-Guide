
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepTwoProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const StepTwo = ({ formData, onInputChange }: StepTwoProps) => {
  const religions = [
    { value: "buddhism", label: "佛教" },
    { value: "taoism", label: "道教" },
    { value: "christianity", label: "基督教" },
    { value: "catholicism", label: "天主教" },
    { value: "islam", label: "伊斯蘭教" },
    { value: "none", label: "無特定宗教" },
    { value: "other", label: "其他" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 聯絡人姓名 */}
        <div className="space-y-2">
          <Label htmlFor="contactName">主要聯絡人姓名 *</Label>
          <Input
            id="contactName"
            value={formData.contactName}
            onChange={(e) => onInputChange('contactName', e.target.value)}
            placeholder="請輸入聯絡人姓名"
          />
        </div>

        {/* 聯絡電話 */}
        <div className="space-y-2">
          <Label htmlFor="contactPhone">聯絡電話 *</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => onInputChange('contactPhone', e.target.value)}
            placeholder="請輸入聯絡電話"
          />
        </div>

        {/* 電子郵件 */}
        <div className="space-y-2">
          <Label htmlFor="contactEmail">電子郵件</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => onInputChange('contactEmail', e.target.value)}
            placeholder="請輸入電子郵件"
          />
        </div>

        {/* 宗教信仰 */}
        <div className="space-y-2">
          <Label>宗教信仰</Label>
          <Select value={formData.religion} onValueChange={(value) => onInputChange('religion', value)}>
            <SelectTrigger>
              <SelectValue placeholder="請選擇宗教信仰" />
            </SelectTrigger>
            <SelectContent>
              {religions.map((religion) => (
                <SelectItem key={religion.value} value={religion.value}>
                  {religion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
        <h3 className="font-medium text-foreground mb-2">資料用途說明</h3>
        <p className="text-sm text-muted-foreground">
          您提供的聯絡資訊將用於後續流程協調與通知。宗教信仰資訊將協助我們提供更符合傳統的建議與安排。
          所有個人資料都將受到妥善保護，不會外洩給第三方。
        </p>
      </div>
    </div>
  );
};

export default StepTwo;

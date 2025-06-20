import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

  const zodiacSigns = [
    { value: "鼠", label: "鼠" },
    { value: "牛", label: "牛" },
    { value: "虎", label: "虎" },
    { value: "兔", label: "兔" },
    { value: "龍", label: "龍" },
    { value: "蛇", label: "蛇" },
    { value: "馬", label: "馬" },
    { value: "羊", label: "羊" },
    { value: "猴", label: "猴" },
    { value: "雞", label: "雞" },
    { value: "狗", label: "狗" },
    { value: "豬", label: "豬" }
  ];

  const handleZodiacChange = (zodiac: string, checked: boolean) => {
    const currentZodiacs = formData.familyZodiacs || [];
    let newZodiacs;
    
    if (checked) {
      newZodiacs = [...currentZodiacs, zodiac];
    } else {
      newZodiacs = currentZodiacs.filter((z: string) => z !== zodiac);
    }
    
    onInputChange('familyZodiacs', newZodiacs);
  };

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

      {/* 家屬生肖多選 */}
      <div className="space-y-4">
        <Label>家屬生肖</Label>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {zodiacSigns.map((zodiac) => (
            <div key={zodiac.value} className="flex items-center space-x-2">
              <Checkbox
                id={`zodiac-${zodiac.value}`}
                checked={(formData.familyZodiacs || []).includes(zodiac.value)}
                onCheckedChange={(checked) => handleZodiacChange(zodiac.value, checked as boolean)}
              />
              <Label
                htmlFor={`zodiac-${zodiac.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {zodiac.label}
              </Label>
            </div>
          ))}
        </div>
        {formData.familyZodiacs && formData.familyZodiacs.length > 0 && (
          <div className="text-sm text-muted-foreground">
            已選擇：{formData.familyZodiacs.join('、')}
          </div>
        )}
      </div>

      <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
        <h3 className="font-medium text-foreground mb-2">資料用途說明</h3>
        <p className="text-sm text-muted-foreground">
          您提供的聯絡資訊將用於後續流程協調與通知。宗教信仰資訊將協助我們提供更符合傳統的建議與安排。
          家屬生肖資訊將用於計算沖煞，避免在重要儀式中與家屬生肖相沖的時辰。
          所有個人資料都將受到妥善保護，不會外洩給第三方。
        </p>
      </div>
    </div>
  );
};

export default StepTwo;

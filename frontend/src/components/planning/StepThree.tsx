
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepThreeProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const StepThree = ({ formData, onInputChange }: StepThreeProps) => {
  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const expectedDaysOptions = [
    { value: 3, label: "3天內" },
    { value: 7, label: "一週內" },
    { value: 14, label: "兩週內" },
    { value: 30, label: "一個月內" },
    { value: 60, label: "兩個月內" }
  ];

  return (
    <div className="space-y-8">
      {/* 預算範圍 */}
      <div className="space-y-4">
        <Label className="text-lg">預算範圍</Label>
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-2xl font-bold">
              {formatBudget(formData.budget)}
            </span>
          </div>
          <Slider
            value={[formData.budget]}
            onValueChange={(value) => onInputChange('budget', value[0])}
            max={500000}
            min={20000}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>NT$ 20,000</span>
            <span>NT$ 500,000+</span>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            預算範圍將影響服務方案的推薦，我們會根據您的預算提供最適合的選擇。
          </p>
        </div>
      </div>

      {/* 期望完成天數 */}
      <div className="space-y-2">
        <Label className="text-lg">期望完成天數</Label>
        <Select 
          value={formData.expectedDays.toString()} 
          onValueChange={(value) => onInputChange('expectedDays', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="請選擇期望的完成時間" />
          </SelectTrigger>
          <SelectContent>
            {expectedDaysOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 特殊需求 */}
      <div className="space-y-2">
        <Label htmlFor="specialRequirements" className="text-lg">
          特殊需求或注意事項
        </Label>
        <Textarea
          id="specialRequirements"
          value={formData.specialRequirements}
          onChange={(e) => onInputChange('specialRequirements', e.target.value)}
          placeholder="如有任何特殊需求、家族傳統、或需要特別注意的事項，請在此說明..."
          className="min-h-[120px]"
        />
        <p className="text-sm text-muted-foreground">
          例如：特定的儀式要求、場地限制、時間限制等
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
        <h3 className="font-medium text-foreground mb-2">即將完成</h3>
        <p className="text-sm text-muted-foreground">
          感謝您提供詳細的資訊。接下來，我們將根據您的需求生成專屬的流程規劃，
          包含農民曆查詢、祭祀日曆、吉日推薦等完整服務。
        </p>
      </div>
    </div>
  );
};

export default StepThree;

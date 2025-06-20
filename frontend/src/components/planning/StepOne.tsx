import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StepOneProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const StepOne = ({ formData, onInputChange }: StepOneProps) => {
  const zodiacSigns = [
    "鼠", "牛", "虎", "兔", "龍", "蛇", 
    "馬", "羊", "猴", "雞", "狗", "豬"
  ];

  const taiwanCities = [
    "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市",
    "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
    "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "臺東縣", "澎湖縣", "金門縣", "連江縣"
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 姓名 */}
        <div className="space-y-2">
          <Label htmlFor="deceasedName">往生者姓名 *</Label>
          <Input
            id="deceasedName"
            value={formData.deceasedName}
            onChange={(e) => onInputChange('deceasedName', e.target.value)}
            placeholder="請輸入往生者姓名"
          />
        </div>

        {/* 性別 */}
        <div className="space-y-2">
          <Label>性別 *</Label>
          <Select value={formData.gender} onValueChange={(value) => onInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="請選擇性別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">男性</SelectItem>
              <SelectItem value="female">女性</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 生肖 */}
        <div className="space-y-2">
          <Label>生肖</Label>
          <Select value={formData.zodiac} onValueChange={(value) => onInputChange('zodiac', value)}>
            <SelectTrigger>
              <SelectValue placeholder="請選擇生肖" />
            </SelectTrigger>
            <SelectContent>
              {zodiacSigns.map((sign) => (
                <SelectItem key={sign} value={sign}>{sign}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 生日 */}
        <div className="space-y-2">
          <Label>生日</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? (
                  format(new Date(formData.birthDate), "yyyy年MM月dd日")
                ) : (
                  <span>請選擇日期</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.birthDate}
                onSelect={(date) => onInputChange('birthDate', date)}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 所在縣市 */}
        <div className="space-y-2">
          <Label htmlFor="city">所在縣市</Label>
          <Select value={formData.city} onValueChange={(value) => onInputChange('city', value)}>
            <SelectTrigger id="city">
              <SelectValue placeholder="請選擇縣市" />
            </SelectTrigger>
            <SelectContent>
              {taiwanCities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 過世日期 */}
      <div className="space-y-4">
        <Label>過世日期 *</Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.deathDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.deathDate ? (
                format(new Date(formData.deathDate), "yyyy年MM月dd日")
              ) : (
                <span>請選擇日期</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.deathDate}
              onSelect={(date) => onInputChange('deathDate', date)}
              disabled={(date) => date > new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default StepOne;

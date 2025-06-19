
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar as CalendarIcon, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const LunarCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLunar, setIsLunar] = useState(false);

  // 模擬農民曆資料
  const lunarData = {
    lunarDate: "甲辰年 十一月 初八",
    solarTerm: "大雪",
    suitable: ["祭祀", "祈福", "求嗣", "開光", "出行"],
    unsuitable: ["嫁娶", "動土", "開市", "安葬"],
    conflict: "沖虎(戊寅)煞南",
    direction: {
      god: "東北",
      wealth: "正東",
      fortune: "西南"
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 日期選擇 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            日期選擇
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4" />
              <Switch
                id="calendar-mode"
                checked={isLunar}
                onCheckedChange={setIsLunar}
              />
              <Moon className="w-4 h-4" />
              <Label htmlFor="calendar-mode" className="text-sm">
                {isLunar ? '農曆' : '國曆'}
              </Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border pointer-events-auto"
          />
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-center font-medium text-foreground">
              選擇日期：{format(selectedDate, "yyyy年MM月dd日")}
            </p>
            {isLunar && (
              <p className="text-center text-muted-foreground mt-1">
                農曆：{lunarData.lunarDate}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 農民曆資訊 */}
      <div className="space-y-6">
        {/* 基本資訊 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">當日資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">農曆日期</h4>
                <p className="text-muted-foreground">{lunarData.lunarDate}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">節氣</h4>
                <p className="text-muted-foreground">{lunarData.solarTerm}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">沖煞</h4>
              <p className="text-destructive">{lunarData.conflict}</p>
            </div>
          </CardContent>
        </Card>

        {/* 宜忌事項 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">宜忌事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-is-success mb-2 flex items-center">
                <span className="w-3 h-3 bg-is-success rounded-full mr-2"></span>
                宜
              </h4>
              <div className="flex flex-wrap gap-2">
                {lunarData.suitable.map((item, index) => (
                  <span key={index} className="px-3 py-1 bg-is-success/10 text-is-success rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-destructive mb-2 flex items-center">
                <span className="w-3 h-3 bg-destructive rounded-full mr-2"></span>
                忌
              </h4>
              <div className="flex flex-wrap gap-2">
                {lunarData.unsuitable.map((item, index) => (
                  <span key={index} className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 方位資訊 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">吉方資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <h5 className="font-medium text-primary mb-1">喜神方位</h5>
                <p className="text-primary/80">{lunarData.direction.god}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <h5 className="font-medium text-accent-foreground mb-1">財神方位</h5>
                <p className="text-accent-foreground/80">{lunarData.direction.wealth}</p>
              </div>
              <div className="p-3 bg-is-success/10 rounded-lg">
                <h5 className="font-medium text-is-success mb-1">福神方位</h5>
                <p className="text-is-success/80">{lunarData.direction.fortune}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LunarCalendar;

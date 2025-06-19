
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Heart, Download, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isSameDay } from "date-fns";

const RitualCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  // 模擬基準日期（往生日期）
  const deathDate = new Date('2024-12-01');
  
  // 計算所有祭祀日期
  const ritualDates = [
    { name: "頭七", date: addDays(deathDate, 6), type: "seven", description: "第一個七日，家屬開始守孝" },
    { name: "二七", date: addDays(deathDate, 13), type: "seven", description: "第二個七日祭祀" },
    { name: "三七", date: addDays(deathDate, 20), type: "seven", description: "第三個七日祭祀" },
    { name: "四七", date: addDays(deathDate, 27), type: "seven", description: "第四個七日祭祀" },
    { name: "五七", date: addDays(deathDate, 34), type: "seven", description: "第五個七日祭祀，通常較為重要" },
    { name: "六七", date: addDays(deathDate, 41), type: "seven", description: "第六個七日祭祀" },
    { name: "七七", date: addDays(deathDate, 48), type: "seven", description: "滿七，守孝期結束" },
    { name: "百日", date: addDays(deathDate, 99), type: "hundred", description: "百日祭，重要的紀念日" },
    { name: "對年", date: addDays(deathDate, 364), type: "anniversary", description: "週年祭祀" },
    { name: "三年", date: addDays(deathDate, 1094), type: "anniversary", description: "三週年祭祀" }
  ];

  // 檢查日期是否為祭祀日
  const getRitualForDate = (date: Date) => {
    return ritualDates.find(ritual => isSameDay(ritual.date, date));
  };

  const selectedRitual = selectedDate ? getRitualForDate(selectedDate) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 日曆 */}
      <div className="lg:col-span-2">
        <Card className="shadow-minimal border-0 bg-card">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="text-card-foreground font-light text-lg">祭祀日曆</CardTitle>
            <p className="text-muted-foreground text-sm font-light">往生日期：{format(deathDate, "yyyy年MM月dd日")}</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="w-fit-content mx-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
                modifiers={{
                  ritual: ritualDates.map(ritual => ritual.date)
                }}
                modifiersStyles={{
                  ritual: { backgroundColor: 'var(--vi-primary)', color: 'white', borderRadius: '50%' }
                }}
              />
            </div>
            
            {/* 圖例 */}
            <div className="mt-8 p-6 bg-muted rounded border-l-4 border-primary">
              <h4 className="font-light text-foreground mb-4 text-sm uppercase tracking-wider">圖例說明</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 bg-primary rounded-full"></span>
                  <span className="text-sm text-muted-foreground font-light">七日祭祀（頭七至七七）</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 bg-accent rounded-full"></span>
                  <span className="text-sm text-muted-foreground font-light">百日祭</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 bg-secondary rounded-full"></span>
                  <span className="text-sm text-muted-foreground font-light">週年祭祀</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 祭祀資訊 */}
      <div className="space-y-6">
        {/* 選擇日期資訊 */}
        {selectedRitual && (
          <Card className="shadow-minimal border-0 bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-card-foreground font-light text-base">
                {format(selectedDate!, "MM月dd日")} - {selectedRitual.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-foreground font-light leading-relaxed">{selectedRitual.description}</p>
                <div className="p-4 bg-muted rounded border-l-2 border-primary">
                  <h5 className="font-light text-foreground mb-2 text-sm uppercase tracking-wider">建議事項</h5>
                  <ul className="text-sm text-muted-foreground font-light space-y-1 leading-relaxed">
                    <li>• 準備祭品與鮮花</li>
                    <li>• 燒香祭拜</li>
                    <li>• 家屬團聚追思</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 所有祭祀日期列表 */}
        <Card className="shadow-minimal border-0 bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-card-foreground font-light text-base">所有祭祀日期</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {ritualDates.map((ritual, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded border cursor-pointer transition-all duration-200 ${
                    selectedDate && isSameDay(ritual.date, selectedDate) 
                      ? 'bg-muted border-primary' 
                      : 'hover:bg-muted border-transparent'
                  }`}
                  onClick={() => setSelectedDate(ritual.date)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-light text-foreground">{ritual.name}</h4>
                      <p className="text-sm text-muted-foreground font-light mt-1">
                        {format(ritual.date, "yyyy年MM月dd日")}
                      </p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${
                      ritual.type === 'seven' ? 'bg-primary' :
                      ritual.type === 'hundred' ? 'bg-accent' :
                      'bg-secondary'
                    }`}></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 祭祀注意事項 */}
        <Card className="shadow-minimal border-0 bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-card-foreground font-light text-base">祭祀注意事項</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-sm font-light">
              <div className="p-4 bg-muted rounded border-l-2 border-accent">
                <h5 className="font-light text-foreground mb-2 text-xs uppercase tracking-wider">準備物品</h5>
                <p className="text-muted-foreground">鮮花、水果、香燭、紙錢等祭品</p>
              </div>
              <div className="p-4 bg-muted rounded border-l-2 border-is-success">
                <h5 className="font-light text-foreground mb-2 text-xs uppercase tracking-wider">時間安排</h5>
                <p className="text-muted-foreground">建議在上午進行祭祀活動</p>
              </div>
              <div className="p-4 bg-muted rounded border-l-2 border-primary">
                <h5 className="font-light text-foreground mb-2 text-xs uppercase tracking-wider">家庭聚會</h5>
                <p className="text-muted-foreground">鼓勵家屬共同參與，加強家庭凝聚力</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RitualCalendar;

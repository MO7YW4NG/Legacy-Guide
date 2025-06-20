import { useState, useEffect } from "react";
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

  // API 農民曆資料
  const [lunarData, setLunarData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    const dateStr = selectedDate.toISOString().slice(0, 10);
    fetch(`http://localhost:8000/api/lunar?date=${dateStr}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setLunarData(data);
        setLoading(false);
      })
      .catch(() => {
        setError('查詢失敗，請稍後再試');
        setLoading(false);
      });
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 日期選擇 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            日期選擇
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border pointer-events-auto mx-auto"
          />
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-center font-medium text-foreground">
              選擇日期：{format(selectedDate, "yyyy年MM月dd日")}
            </p>
            {loading && <p className="text-center text-muted-foreground mt-1">查詢中...</p>}
            {error && <p className="text-center text-destructive mt-1">{error}</p>}
            {lunarData && (
              <p className="text-center text-muted-foreground mt-1">
                農曆：{lunarData.農曆}
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
                <p className="text-muted-foreground">{lunarData ? lunarData.農曆 : '-'}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">節氣</h4>
                <p className="text-muted-foreground">{lunarData ? lunarData.節氣 : '-'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">沖煞</h4>
              <p className="text-destructive">{lunarData ? lunarData.沖煞 : '-'}</p>
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
                {lunarData && lunarData.宜 && lunarData.宜.length > 0 ? lunarData.宜.map((item: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-is-success/10 text-is-success rounded-full text-sm">
                    {item}
                  </span>
                )) : <span className="text-muted-foreground">-</span>}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-destructive mb-2 flex items-center">
                <span className="w-3 h-3 bg-destructive rounded-full mr-2"></span>
                忌
              </h4>
              <div className="flex flex-wrap gap-2">
                {lunarData && lunarData.忌 && lunarData.忌.length > 0 ? lunarData.忌.map((item: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
                    {item}
                  </span>
                )) : <span className="text-muted-foreground">-</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 方位資訊 */}
        {/* 目前 API 沒有 direction，暫時隱藏這區塊 */}
        {/*
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">吉方資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <h5 className="font-medium text-primary mb-1">喜神方位</h5>
                <p className="text-primary/80">{{lunarData.direction.god}}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <h5 className="font-medium text-accent-foreground mb-1">財神方位</h5>
                <p className="text-accent-foreground/80">{{lunarData.direction.wealth}}</p>
              </div>
              <div className="p-3 bg-is-success/10 rounded-lg">
                <h5 className="font-medium text-is-success mb-1">福神方位</h5>
                <p className="text-is-success/80">{{lunarData.direction.fortune}}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        */}
      </div>
    </div>
  );
};

export default LunarCalendar;

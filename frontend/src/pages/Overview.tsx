import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, Heart, Star, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays, differenceInYears } from "date-fns";
import { OverviewCalendar } from "@/components/overview/OverviewCalendar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Overview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData || {};

  const deathDateForCalc = formData.deathDate ? new Date(formData.deathDate) : new Date();
  const birthDateForCalc = formData.birthDate ? new Date(formData.birthDate) : null;
  
  let age = null;
  if (birthDateForCalc) {
    age = differenceInYears(deathDateForCalc, birthDateForCalc);
  }

  // 計算重要祭祀日期
  const deathDate = formData.deathDate ? new Date(formData.deathDate) : new Date();
  const ritualDates = {
    頭七: addDays(deathDate, 6),
    day14: addDays(deathDate, 13),
    day21: addDays(deathDate, 20),
    day28: addDays(deathDate, 27),
    day35: addDays(deathDate, 34),
    day42: addDays(deathDate, 41),
    滿七: addDays(deathDate, 48),
    百日: addDays(deathDate, 99),
    對年: addDays(deathDate, 364),
    三年: addDays(deathDate, 1094)
  };

  // 模擬吉日推薦
  const auspiciousDays = [
    {
      date: addDays(deathDate, 3),
      reason: "此日宜祭祀，適合進行告別儀式",
      goodFor: "祭祀、入殮、安葬",
      badFor: "嫁娶、移徙",
      conflicts: "沖龍(壬辰)煞北"
    },
    {
      date: addDays(deathDate, 5),
      reason: "黃道吉日，諸事皆宜",
      goodFor: "祭祀、祈福、求嗣",
      badFor: "開市、動土",
      conflicts: "沖猴(甲申)煞南"
    },
    {
      date: ritualDates.頭七,
      reason: "此日雖為頭七，亦是吉日，適合誦經祈福",
      goodFor: "祭祀、誦經",
      badFor: "出行、上樑",
      conflicts: "沖狗(丙戌)煞西"
    }
  ];

  const timelineEvents = [
    { 
      title: "入殮準備", 
      date: deathDate, 
      description: "準備入殮用品，聯繫殯葬服務",
      status: "completed"
    },
    { 
      title: "告別式", 
      date: auspiciousDays[0].date, 
      description: "舉行告別儀式，親友最後道別",
      status: "upcoming"
    },
    { 
      title: "頭七法會", 
      date: ritualDates.頭七, 
      description: "第一個七日祭祀",
      status: "upcoming"
    },
    { 
      title: "百日祭", 
      date: ritualDates.百日, 
      description: "百日祭祀儀式",
      status: "future"
    },
    { 
      title: "對年", 
      date: ritualDates.對年, 
      description: "週年祭祀",
      status: "future"
    }
  ];

  return (
    <div className="min-h-screen bg-background -m-4 sm:-m-6">
      {/* 頁首 */}
      <header className="bg-vi-dark text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/10 mr-2 md:hidden" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/planning')}
                className="text-primary-foreground hover:bg-primary-foreground/10 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回規劃
              </Button>
              <h1 className="text-2xl font-bold">流程規劃總覽</h1>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              下載 PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 基本資訊摘要 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">規劃摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground">往生者</h3>
                <p className="text-lg font-bold text-foreground">{formData.deceasedName || "未填寫"}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.gender === 'male' ? '男性' : '女性'}
                  {age !== null ? ` · ${age}歲` : ""}
                </p>
                {formData.cityOfResidence && <p className="text-sm text-muted-foreground pt-1">居住地: {formData.cityOfResidence}</p>}
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground">聯絡人</h3>
                <p className="text-lg font-bold text-foreground">{formData.contactName || "未填寫"}</p>
                <p className="text-sm text-muted-foreground">{formData.contactPhone}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground">預算範圍</h3>
                <p className="text-lg font-bold text-foreground">
                  NT$ {formData.budget?.toLocaleString() || "未設定"}
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground">期望時間</h3>
                <p className="text-lg font-bold text-foreground">{formData.expectedDays}天內</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <OverviewCalendar 
          deathDate={deathDate}
          ritualDates={ritualDates}
          auspiciousDays={auspiciousDays}
        />

        {/* 流程時間軸 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              流程時間軸
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                    event.status === 'completed' ? 'bg-is-success' :
                    event.status === 'upcoming' ? 'bg-primary' : 'bg-muted-foreground'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(event.date, "yyyy年MM月dd日")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button onClick={() => navigate('/lunar-calendar')} variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            查看農民曆
          </Button>
          <Button onClick={() => navigate('/ritual-calendar')} variant="outline">
            <Heart className="w-4 h-4 mr-2" />
            祭祀日曆
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            下載完整規劃
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Overview;

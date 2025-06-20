import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, Heart, Star, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays, differenceInYears, startOfMonth, endOfMonth } from "date-fns";
import { OverviewCalendar } from "@/components/overview/OverviewCalendar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/utils";
import { SummaryCard } from "@/components/overview/SummaryCard";
import { TimelineCard } from "@/components/overview/TimelineCard";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { ActionButtons } from "@/components/overview/ActionButtons";

interface AuspiciousDay {
  date: Date;
  reason: string;
  goodFor: string;
  badFor: string;
  conflicts: string;
}

type TimelineStatus = 'completed' | 'upcoming' | 'future';

const Overview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData || {};
  const [auspiciousDays, setAuspiciousDays] = useState<AuspiciousDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuspiciousDays = async () => {
      if (!formData.deathDate || !formData.zodiac || !formData.familyZodiacs) {
        setIsLoading(false);
        return;
      }

      try {
        const deathDate = new Date(formData.deathDate);
        const requestBody = {
          deceased_zodiac: formData.zodiac,
          deceased_death_date: format(deathDate, "yyyy-MM-dd"),
          family_zodiacs: formData.familyZodiacs,
          start_date: format(startOfMonth(deathDate), "yyyy-MM-dd"),
          end_date: format(endOfMonth(addDays(deathDate, 100)), "yyyy-MM-dd"),
        };

        const response = await fetch(`${getBackendUrl()}/auspicious-days/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch auspicious days");
        }

        const data = await response.json();
        const formattedDays = data.recommended_dates.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        }));
        setAuspiciousDays(formattedDays);
      } catch (error) {
        console.error("Error fetching auspicious days:", error);
        // On error, you might want to set some default/mock data or show an error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuspiciousDays();
  }, [formData]);

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
  const mockAuspiciousDays = [
    {
      date: addDays(deathDate, 3),
      reason: "此日宜祭祀，適合進行告別儀式",
      goodFor: "祭祀、入殮、安葬",
      badFor: "嫁娶、移徙",
      conflicts: "沖狗(丙戌)煞西"
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

  const displayDays = auspiciousDays.length > 0 ? auspiciousDays : mockAuspiciousDays;

  const timelineEvents: { title: string; date: Date; description: string; status: TimelineStatus }[] = [
    { 
      title: "入殮準備", 
      date: deathDate, 
      description: "準備入殮用品，聯繫殯葬服務",
      status: "completed"
    },
    { 
      title: "告別式", 
      date: displayDays.length > 0 ? displayDays[0].date : addDays(deathDate, 3), 
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
      <OverviewHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 基本資訊摘要 */}
        <SummaryCard formData={{...formData, age}} />

        <OverviewCalendar 
          deathDate={deathDate}
          ritualDates={ritualDates}
          auspiciousDays={displayDays}
          city={formData.city}
        />

        {/* 流程時間軸 */}
        <TimelineCard events={timelineEvents} />

        {/* 操作按鈕 */}
        <ActionButtons formData={formData} />
      </main>
    </div>
  );
};

export default Overview;

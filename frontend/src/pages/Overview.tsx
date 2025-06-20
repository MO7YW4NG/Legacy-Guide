import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, Heart, Star, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays, differenceInYears, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { OverviewCalendar } from "@/components/overview/OverviewCalendar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo } from "react";
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
  
  // Guard against missing or invalid data
  useEffect(() => {
    if (!formData.deathDate || isNaN(new Date(formData.deathDate).getTime())) {
      console.error("Overview page loaded without valid data. Redirecting.");
      navigate('/');
    }
  }, [formData, navigate]);

  // Prevent rendering with invalid data, which would cause a crash
  if (!formData.deathDate || isNaN(new Date(formData.deathDate).getTime())) {
    return null;
  }

  const initialMonth = useMemo(() => (
    formData.deathDate ? new Date(formData.deathDate) : new Date()
  ), [formData.deathDate]);

  const [viewedMonth, setViewedMonth] = useState(initialMonth);
  const [auspiciousDays, setAuspiciousDays] = useState<AuspiciousDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomDates, setSelectedCustomDates] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAuspiciousDays = async () => {
      if (!formData.deathDate || !formData.zodiac || !formData.familyZodiacs) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const requestBody = {
          亡者生肖: formData.zodiac,
          亡者歿日: format(initialMonth, "yyyy-MM-dd"),
          家屬生肖: formData.familyZodiacs,
          查詢起始日期: format(startOfMonth(viewedMonth), "yyyy-MM-dd"),
          查詢結束日期: format(endOfMonth(viewedMonth), "yyyy-MM-dd"),
        };

        const response = await fetch(`${getBackendUrl()}/api/auspicious-days/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch auspicious days");
        }

        const data = await response.json();
        const formattedDays = data.推薦日期.map((day: any) => ({
          date: new Date(day.日期),
          reason: day.推薦理由,
          goodFor: day.農曆資訊.宜.join(', '),
          badFor: day.農曆資訊.忌.join(', '),
          conflicts: day.衝突列表.map((c: any) => c.說明).join(', '),
        }));
        
        setAuspiciousDays(prevDays => {
          const newDays = formattedDays.filter(
            (day: AuspiciousDay) => !prevDays.some(
              prevDay => isSameDay(prevDay.date, day.date)
            )
          );
          return [...prevDays, ...newDays];
        });

      } catch (error) {
        console.error("Error fetching auspicious days:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuspiciousDays();
  }, [formData, viewedMonth, initialMonth]);

  const handleSelectedCustomDatesChange = (dates: { [key: string]: string }) => {
    setSelectedCustomDates(dates);
  };

  const deathDate = useMemo(() => (
    formData.deathDate ? new Date(formData.deathDate) : new Date()
  ), [formData.deathDate]);

  const birthDateForCalc = useMemo(() => (
    formData.birthDate ? new Date(formData.birthDate) : null
  ), [formData.birthDate]);
  
  let age = null;
  if (birthDateForCalc) {
    age = differenceInYears(deathDate, birthDateForCalc);
  }

  // 計算重要祭祀日期
  const ritualDates = useMemo(() => ({
    頭七: addDays(deathDate, 6),
    二七: addDays(deathDate, 13),
    三七: addDays(deathDate, 20),
    四七: addDays(deathDate, 27),
    五七: addDays(deathDate, 34),
    六七: addDays(deathDate, 41),
    滿七: addDays(deathDate, 48),
    百日: addDays(deathDate, 99),
    對年: addDays(deathDate, 364),
    三年: addDays(deathDate, 1094)
  }), [deathDate]);

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

  const allEvents = useMemo(() => {
    const events: { [key: string]: string } = {};
    
    // Add ritual dates
    Object.entries(ritualDates).forEach(([name, date]) => {
      events[name] = format(date, "yyyy-MM-dd");
    });

    // Add selected custom dates
    Object.assign(events, selectedCustomDates);

    return events;
  }, [ritualDates, selectedCustomDates]);

  const timelineEvents: { title: string; date: Date; description: string; status: TimelineStatus }[] = [
    { 
      title: "入殮準備", 
      date: deathDate, 
      description: "準備入殮用品，聯繫殯葬服務",
      status: "completed"
    },
    { 
      title: "告別式", 
      date: auspiciousDays.length > 0 ? auspiciousDays[0].date : addDays(deathDate, 3), 
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
          auspiciousDays={auspiciousDays}
          city={formData.city}
          selectedCustomDates={selectedCustomDates}
          onSelectedCustomDatesChange={handleSelectedCustomDatesChange}
          onCalendarMonthChange={setViewedMonth}
        />

        {/* 流程時間軸 */}
        <TimelineCard events={timelineEvents} />

        {/* 操作按鈕 */}
        <ActionButtons allEvents={allEvents} />
      </main>
    </div>
  );
};

export default Overview;

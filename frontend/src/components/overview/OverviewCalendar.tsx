import * as React from "react";
import { useState, useMemo } from "react";
import { format, addDays, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { DayContentProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Star, Heart, Flame } from "lucide-react";

interface DayData {
  date: Date;
  ritualName?: string;
  auspiciousReason?: string;
  goodFor?: string;
  badFor?: string;
  conflicts?: string;
  cremationStatus: "額滿" | "尚有名額";
}

interface OverviewCalendarProps {
  deathDate: Date;
  ritualDates: { [key: string]: Date };
  auspiciousDays: Array<{
    date: Date;
    reason: string;
    goodFor: string;
    badFor: string;
    conflicts: string;
  }>;
}

export function OverviewCalendar({ deathDate, ritualDates, auspiciousDays }: OverviewCalendarProps) {
  const [month, setMonth] = useState(deathDate);
  const [selectedData, setSelectedData] = useState<DayData | null>(null);

  const calendarData = useMemo(() => {
    const dataMap = new Map<string, DayData>();
    const ritualDatesArray = Object.entries(ritualDates).map(([name, date]) => ({ name: name.replace(/day|year/,''), date }));
    
    // Generate data for a wider range of dates to ensure we have data when user navigates months
    const startDate = startOfMonth(addDays(deathDate, -30));
    const endDate = endOfMonth(addDays(deathDate, 90));

    for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
      const dateStr = format(day, "yyyy-MM-dd");
      const ritual = ritualDatesArray.find(r => isSameDay(r.date, day));
      const auspicious = auspiciousDays.find(a => isSameDay(a.date, day));

      // Mock cremation status
      let cremationStatus: "額滿" | "尚有名額";
      const dayOfWeek = day.getDay();
      if (auspicious || ritual) {
          cremationStatus = Math.random() > 0.2 ? '額滿' : '尚有名額';
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
          cremationStatus = Math.random() > 0.5 ? '額滿' : '尚有名額';
      } else {
          cremationStatus = Math.random() > 0.8 ? '額滿' : '尚有名額';
      }

      dataMap.set(dateStr, {
        date: day,
        ritualName: ritual?.name,
        auspiciousReason: auspicious?.reason,
        goodFor: auspicious?.goodFor,
        badFor: auspicious?.badFor,
        conflicts: auspicious?.conflicts,
        cremationStatus: cremationStatus,
      });
    }
    return dataMap;
  }, [deathDate, ritualDates, auspiciousDays]);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const data = calendarData.get(dateStr);
    
    if (data) {
        setSelectedData(data);
    } else {
        // Create default data for any clicked date outside the pre-generated range
        setSelectedData({
            date: date,
            cremationStatus: Math.random() > 0.7 ? '額滿' : '尚有名額',
        });
    }
  };

  const DayContent = ({ date }: DayContentProps) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const data = calendarData.get(dateStr);

    return (
      <div className={cn("w-full h-full p-1 flex flex-col items-center justify-between text-center")}>
        <p className="font-medium text-sm">{format(date, 'd')}</p>
        <div className="text-xs space-y-1 leading-tight flex-grow flex flex-col justify-center items-center">
          {data?.ritualName && <div className="text-destructive font-semibold">{data.ritualName}</div>}
          {data?.auspiciousReason && !data.ritualName && <div className="text-is-success font-semibold">[吉日推薦]</div>}
        </div>
        <div className="text-xs w-full">
          {data?.cremationStatus === '額滿' ? 
            <div className="text-destructive/80">火化(額滿)</div> :
            <div className="text-muted-foreground">火化(可預約)</div>
          }
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
            吉日與祭祀總覽
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Calendar
            mode="single"
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            components={{ DayContent }}
            showOutsideDays={false}
            classNames={{
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md font-normal text-[0.8rem] text-center flex-1",
              day_selected: "bg-primary/20 text-foreground",
              day: cn(
                "h-24 w-full rounded-lg border border-border/50 transition-colors hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring",
                "aria-selected:bg-primary/10 aria-selected:border-primary/50"
              ),
              cell: "p-1 flex-1",
              row: "flex w-full mt-2",
              months: "w-full",
            }}
          />
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedData} onOpenChange={(open) => !open && setSelectedData(null)}>
        {selectedData && (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{format(selectedData.date, "yyyy年MM月dd日")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {selectedData.auspiciousReason && (
                        <div className="p-4 bg-amber-50/50 border-l-4 border-amber-400 rounded">
                            <h3 className="font-semibold flex items-center mb-2"><Star className="w-4 h-4 mr-2 text-amber-500"/>吉日資訊</h3>
                            <p><span className="font-medium">說明:</span> {selectedData.auspiciousReason}</p>
                            <div className="mt-3 pt-3 border-t border-amber-200">
                                <h4 className="font-medium mb-2">注意事項</h4>
                                <ul className="list-none space-y-1 text-sm">
                                    {selectedData.goodFor && <li><span className="font-semibold text-green-600">宜：</span>{selectedData.goodFor}</li>}
                                    {selectedData.badFor && <li><span className="font-semibold text-red-600">忌：</span>{selectedData.badFor}</li>}
                                    {selectedData.conflicts && <li><span className="font-semibold text-slate-600">沖煞：</span>{selectedData.conflicts}</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                    {selectedData.ritualName && (
                        <div className="p-4 bg-red-50/50 border-l-4 border-red-400 rounded">
                            <h3 className="font-semibold flex items-center mb-2"><Heart className="w-4 h-4 mr-2 text-destructive"/>重要祭祀日</h3>
                            <p>本日為：{selectedData.ritualName}</p>
                        </div>
                    )}
                    <div className="p-4 bg-slate-50/50 border-l-4 border-slate-400 rounded">
                        <h3 className="font-semibold flex items-center mb-2"><Flame className="w-4 h-4 mr-2 text-orange-500"/>火化時程</h3>
                        <p>狀態: {selectedData.cremationStatus}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedData(null)}>關閉</Button>
                    <Button className="bg-vi-dark hover:opacity-90">選擇此日期</Button>
                </DialogFooter>
            </DialogContent>
        )}
      </Dialog>
    </>
  );
}

import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBackendUrl } from "@/lib/utils";

interface ActionButtonsProps {
  allEvents: { [key: string]: string };
}

export const ActionButtons = ({ allEvents }: ActionButtonsProps) => {
  const navigate = useNavigate();

  const handleDownloadIcs = async () => {
    if (Object.keys(allEvents).length === 0) {
      alert("沒有可匯出的日期");
      return;
    }

    try {
      const url = `${getBackendUrl()}/api/export/ritual_dates.ics`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: allEvents }),
      });
      
      if (!response.ok) {
        throw new Error("下載失敗");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "all_events.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();

    } catch (error) {
      console.error("下載行事曆時發生錯誤:", error);
      alert("下載行事曆時發生錯誤，請稍後再試。");
    }
  };

  return (
    <div className="flex justify-center space-x-4 mt-8">
      <Button onClick={() => navigate('/lunar-calendar')} variant="outline">
        <Calendar className="w-4 h-4 mr-2" />
        查看農民曆
      </Button>
      <Button onClick={handleDownloadIcs}>
        <Download className="w-4 h-4 mr-2" />
        下載行事曆
      </Button>
    </div>
  );
}; 
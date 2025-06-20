import { Button } from "@/components/ui/button";
import { Calendar, Heart, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBackendUrl } from "@/lib/utils";
import { format } from "date-fns";

interface ActionButtonsProps {
  formData: {
    deathDate?: Date | string;
    [key: string]: any;
  };
}

export const ActionButtons = ({ formData }: ActionButtonsProps) => {
  const navigate = useNavigate();

  const handleDownloadIcs = async () => {
    if (!formData.deathDate) {
      alert("請先設定歿日才能下載行事曆");
      return;
    }

    try {
      const date = format(new Date(formData.deathDate), "yyyy-MM-dd");
      const response = await fetch(`${getBackendUrl()}/api/export/ritual_dates.ics?date=${date}&traditional=true`);
      
      if (!response.ok) {
        throw new Error("下載失敗");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ritual_dates.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
      <Button onClick={() => navigate('/ritual-calendar')} variant="outline">
        <Heart className="w-4 h-4 mr-2" />
        祭祀日曆
      </Button>
      <Button onClick={handleDownloadIcs}>
        <Download className="w-4 h-4 mr-2" />
        下載行事曆
      </Button>
    </div>
  );
}; 
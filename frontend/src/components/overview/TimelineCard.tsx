import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface TimelineEvent {
  title: string;
  date: Date;
  description: string;
  status: 'completed' | 'upcoming' | 'future';
}

interface TimelineCardProps {
  events: TimelineEvent[];
}

export const TimelineCard = ({ events }: TimelineCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          流程時間軸
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                event.status === 'completed' ? 'bg-green-500' :
                event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-400'
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
  );
}; 
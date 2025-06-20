import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  formData: {
    deceasedName?: string;
    gender?: 'male' | 'female';
    age?: number | null;
    city?: string;
    contactName?: string;
    contactPhone?: string;
    budget?: number;
    completion_weeks?: number;
  };
}

export const SummaryCard = ({ formData }: SummaryCardProps) => {
  return (
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
              {formData.age !== null && formData.age !== undefined ? ` · ${formData.age}歲` : ""}
            </p>
            {formData.city && <p className="text-sm text-muted-foreground pt-1">辦事地點: {formData.city}</p>}
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground">聯絡人</h3>
            <p className="text-lg font-bold text-foreground">{formData.contactName || "未填寫"}</p>
            <p className="text-sm text-muted-foreground">{formData.contactPhone}</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground">預算範圍</h3>
            <p className="text-lg font-bold text-foreground">
              {formData.budget ? `NT$ ${formData.budget.toLocaleString()}` : "未設定"}
            </p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground">期望時間</h3>
            <p className="text-lg font-bold text-foreground">{formData.completion_weeks ? `${formData.completion_weeks} 週內` : '未設定'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
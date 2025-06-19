
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* 主要內容 */}
      <div className="container mx-auto px-4">
        {/* 歡迎區塊 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            以溫暖與專業，陪伴您度過人生重要時刻
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            結合傳統農民曆智慧與現代科技，為您提供完整的殯葬流程規劃服務。
            讓我們協助您在這個艱難的時刻，妥善安排每一個重要環節。
          </p>
        </div>

        {/* 功能特色 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="w-12 h-12 mx-auto text-vi-primary mb-4" />
              <CardTitle className="text-foreground">農民曆查詢</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                傳統農民曆資訊查詢，包含宜忌事項、節氣、沖煞等詳細資訊
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow" onClick={() => navigate('/ritual-calendar')}>
            <CardHeader>
              <Heart className="w-12 h-12 mx-auto text-vi-primary mb-4" />
              <CardTitle className="text-foreground">祭祀日曆</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                自動計算頭七至七七、百日、對年等重要祭祀日期
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-is-success mb-4" />
              <CardTitle className="text-foreground">流程規劃</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI 智能推薦吉日，提供完整的殯葬流程規劃與建議
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 開始規劃按鈕 */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-vi-dark hover:opacity-90 text-primary-foreground px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate('/planning')}
          >
            <Users className="w-5 h-5 mr-2" />
            開始規劃
          </Button>
          <p className="text-muted-foreground mt-4">
            我們將陪伴您完成每一個步驟
          </p>
        </div>
      </div>
    </>
  );
};

export default Index;

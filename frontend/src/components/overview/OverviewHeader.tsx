import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const OverviewHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
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
        </div>
      </div>
    </header>
  );
}; 
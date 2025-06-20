
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

const pageTitles: { [key: string]: string } = {
  '/': '首頁',
  '/planning': '流程規劃',
  '/lunar-calendar': '農民曆查詢',
  '/ritual-calendar': '祭祀日曆',
  '/urn-simulator': '骨灰罈模擬器',
  // '/obituary-writer': '訃聞撰寫',
  '/chatbot': '智能問答',
};

const AppLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '靈魂日曆';

  // The Overview page has its own header, so we hide the main layout header for it.
  const hideHeader = ['/overview'].includes(location.pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          {!hideHeader && (
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <h1 className="font-semibold text-lg">{title}</h1>
            </header>
          )}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;

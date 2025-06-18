
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Planning from "./pages/Planning";
import LunarCalendar from "./pages/LunarCalendar";
import RitualCalendar from "./pages/RitualCalendar";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";
import Chatbot from "./pages/Chatbot";
import UrnSimulator from "./pages/UrnSimulator";
import ObituaryWriter from "./pages/ObituaryWriter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/lunar-calendar" element={<LunarCalendar />} />
            <Route path="/ritual-calendar" element={<RitualCalendar />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/urn-simulator" element={<UrnSimulator />} />
            <Route path="/obituary-writer" element={<ObituaryWriter />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

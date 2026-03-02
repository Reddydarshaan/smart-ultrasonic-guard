import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import Index from "./pages/Index";
import CodePage from "./pages/CodePage";
import HardwarePage from "./pages/HardwarePage";
import DocsPage from "./pages/DocsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background grid-pattern">
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/code" element={<CodePage />} />
            <Route path="/hardware" element={<HardwarePage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

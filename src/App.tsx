import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import N8nGuide from "./pages/N8nGuide";
import ProductPreview from "./pages/ProductPreview";
import WebhookReceiver from "./pages/WebhookReceiver";
import GumroadWebhookTest from "./pages/GumroadWebhookTest";
import AutomationAgent from "./pages/AutomationAgent";
import MigrationAgent from "./pages/MigrationAgent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/n8n-guide" element={<N8nGuide />} />
          <Route path="/webhook" element={<WebhookReceiver />} />
          <Route path="/preview/:previewId" element={<ProductPreview />} />
          <Route path="/gumroad-webhook-test" element={<GumroadWebhookTest />} />
          <Route path="/automation-agent" element={<AutomationAgent />} />
          <Route path="/migration-agent" element={<MigrationAgent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

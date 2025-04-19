
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import N8nGuide from "./pages/N8nGuide";
import ProductPreview from "./pages/ProductPreview";
import WebhookReceiver from "./pages/WebhookReceiver";
import GumroadWebhookTest from "./pages/GumroadWebhookTest";
import AutomationAgent from "./pages/AutomationAgent";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/n8n-guide" element={<N8nGuide />} />
            <Route path="/webhook" element={<WebhookReceiver />} />
            <Route path="/preview/:previewId" element={<ProductPreview />} />
            <Route path="/gumroad-webhook-test" element={<GumroadWebhookTest />} />
            <Route path="/automation-agent" element={<AutomationAgent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

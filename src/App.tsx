
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import MigratedProducts from "./pages/MigratedProducts";
import ProductPreview from "./pages/ProductPreview";
import ProductsDisplay from "./pages/ProductsDisplay";
import WebhookReceiver from "./pages/WebhookReceiver";
import GumroadWebhookTest from "./pages/GumroadWebhookTest";
import AutomationAgent from "./pages/AutomationAgent";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
            <Route path="/migrated-products" element={<MigratedProducts />} />
            <Route path="/product-preview/:id" element={<ProductPreview />} />
            <Route path="/products-display" element={<ProductsDisplay />} />
            <Route path="/webhook-receiver" element={<WebhookReceiver />} />
            <Route path="/gumroad-webhook-test" element={<GumroadWebhookTest />} />
            <Route path="/automation-agent" element={<AutomationAgent />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import MigratedProducts from "./pages/MigratedProducts";
import ProductsDisplay from "./pages/ProductsDisplay";
import ProductPreview from "./pages/ProductPreview";
import WebhookReceiver from "./pages/WebhookReceiver";
import AutomationAgent from "./pages/AutomationAgent";
import GumroadWebhookTest from "./pages/GumroadWebhookTest";
import NotFound from "./pages/NotFound";
import { AuthContextProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsDisplay />} />
            <Route path="/migrated-products" element={<MigratedProducts />} />
            <Route path="/preview/:id" element={<ProductPreview />} />
            <Route path="/webhook-receiver" element={<WebhookReceiver />} />
            <Route path="/automation" element={<AutomationAgent />} />
            <Route path="/gumroad-test" element={<GumroadWebhookTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthContextProvider>
  </QueryClientProvider>
);

export default App;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generatePreviewId, storeProductsForPreview, getPreviewUrl } from "@/services/PreviewService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// For demo purposes, this simulates receiving a webhook
// In a real environment, this would be handled by a server endpoint
const WebhookReceiver = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateWebhookReceived = () => {
    setIsProcessing(true);
    toast.loading("Processing webhook data...");

    // Simulate webhook data
    const sampleProducts = [
      {
        title: "Digital Marketing Course",
        description: "Learn advanced digital marketing strategies in this comprehensive course.",
        price: "$149",
        image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&q=80&w=500"
      },
      {
        title: "Photography Masterclass",
        description: "Master the art of photography with professional techniques.",
        price: "$99",
        image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&q=80&w=500"
      },
      {
        title: "UI/UX Design Fundamentals",
        description: "Create beautiful user interfaces with modern design principles.",
        price: "$129",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&q=80&w=500"
      }
    ];

    // Generate a preview ID
    const previewId = generatePreviewId();
    
    // Store products for preview
    storeProductsForPreview(sampleProducts, previewId);
    
    // Get the preview URL
    const previewUrl = getPreviewUrl(previewId);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Preview generated successfully!");
      
      // Navigate to the preview page
      navigate(`/preview/${previewId}`, { state: { products: sampleProducts } });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite">
        <div className="section-container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Product Sync Assistant</h1>
            <p className="text-lg text-coolGray mb-8">
              This assistant generates a preview page for products received via webhook.
              Click the button below to simulate receiving a webhook with product data.
            </p>
            
            <Button
              onClick={simulateWebhookReceived}
              disabled={isProcessing}
              className="bg-cta-gradient hover:opacity-90 text-white py-6 px-8 text-lg"
            >
              {isProcessing ? (
                <>
                  <span className="inline-block h-5 w-5 mr-3 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></span>
                  Processing...
                </>
              ) : (
                "Simulate Webhook with Products"
              )}
            </Button>
            
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <ol className="text-left text-coolGray space-y-3">
                <li>1. Products are sent to your webhook endpoint from n8n</li>
                <li>2. A unique preview page is generated</li>
                <li>3. Products are displayed in a clean card layout</li>
                <li>4. Users can review and transfer products to Payhip</li>
                <li>5. The preview URL can be shared with stakeholders</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WebhookReceiver;

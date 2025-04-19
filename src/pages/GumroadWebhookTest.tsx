
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const GumroadWebhookTest = () => {
  const { user, isLoading } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    email: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      toast.loading("Sending migration request...");
      
      // First call our Supabase edge function for logging/validation
      const { data: edgeFunctionData, error: edgeFunctionError } = await fetch(
        "https://yvvqfcwhskthbbjspcvi.supabase.co/functions/v1/gumroad-migration", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        }
      ).then(res => res.json());
      
      if (edgeFunctionError) throw new Error(edgeFunctionError.message);
      
      // Now call the n8n webhook directly
      const n8nResponse = await fetch("https://portify.app.n8n.cloud/webhook/migrate-gumroad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      
      if (!n8nResponse.ok) {
        throw new Error(`N8n webhook error: ${n8nResponse.status}`);
      }
      
      toast.success("Migration request sent successfully!");
    } catch (error) {
      console.error("Error sending webhook data:", error);
      toast.error("Failed to send migration request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Gumroad to Payhip Migration</h1>
            <p className="text-lg text-coolGray">
              Use this form to migrate your Gumroad products to Payhip through our n8n webhook.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Start Migration</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We'll send migration updates to this email address
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-cta-gradient hover:opacity-90 text-white"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                      Processing...
                    </>
                  ) : "Start Migration"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">What happens next?</h2>
            <ol className="list-decimal list-inside space-y-2 text-coolGray">
              <li>Your request is sent to our n8n workflow</li>
              <li>The workflow fetches your Gumroad products</li>
              <li>Products are processed and uploaded to Payhip</li>
              <li>You'll receive an email confirmation when complete</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GumroadWebhookTest;

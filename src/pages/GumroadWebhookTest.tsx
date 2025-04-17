
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const GumroadWebhookTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_email: "",
    product_title: "",
    image_url: "",
    gumroad_product_id: ""
  });
  const [response, setResponse] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    
    try {
      toast.loading("Sending webhook data...");
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("gumroad-migration", {
        body: formData
      });
      
      if (error) {
        throw error;
      }
      
      setResponse(data);
      toast.success("Data sent successfully!");
    } catch (error) {
      console.error("Error sending webhook data:", error);
      toast.error("Failed to send webhook data");
      setResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Gumroad Webhook Test</h1>
            <p className="text-lg text-coolGray">
              This page allows you to test the Gumroad migration webhook endpoint by sending sample data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Send Webhook Data</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="user_email" className="block text-sm font-medium mb-1">
                      User Email *
                    </label>
                    <Input
                      id="user_email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="product_title" className="block text-sm font-medium mb-1">
                      Product Title *
                    </label>
                    <Input
                      id="product_title"
                      name="product_title"
                      value={formData.product_title}
                      onChange={handleInputChange}
                      placeholder="Digital Product Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium mb-1">
                      Image URL
                    </label>
                    <Input
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gumroad_product_id" className="block text-sm font-medium mb-1">
                      Gumroad Product ID *
                    </label>
                    <Input
                      id="gumroad_product_id"
                      name="gumroad_product_id"
                      value={formData.gumroad_product_id}
                      onChange={handleInputChange}
                      placeholder="abc123"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-cta-gradient hover:opacity-90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                        Sending...
                      </>
                    ) : "Send Webhook Data"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-md h-64 overflow-auto font-mono text-sm">
                  {response ? (
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                  ) : (
                    <p className="text-gray-400">No response yet. Send webhook data to see the response here.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <ol className="list-decimal pl-6 space-y-3 text-coolGray">
              <li>Fill in the form with Gumroad product data</li>
              <li>Click "Send Webhook Data" to trigger the webhook</li>
              <li>The data is sent to the Supabase Edge Function</li>
              <li>The function validates the data and inserts it into the migrations table</li>
              <li>You'll see the response on the right panel</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GumroadWebhookTest;

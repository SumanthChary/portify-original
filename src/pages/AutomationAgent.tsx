
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const AutomationAgent = () => {
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
      toast.loading("Processing product migration...");
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("product-migration-agent", {
        body: formData
      });
      
      if (error) {
        throw error;
      }
      
      setResponse(data);
      toast.success("Product migration initiated successfully!");
    } catch (error) {
      console.error("Error processing migration:", error);
      toast.error("Failed to process migration");
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Migration Automation Agent</h1>
            <p className="text-lg text-coolGray">
              This agent processes Gumroad products, uploads images to Cloudinary, and sends email notifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Process Product Migration</CardTitle>
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
                        Processing...
                      </>
                    ) : "Process Migration"}
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
                    <p className="text-gray-400">No response yet. Submit the form to see results here.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <ol className="list-decimal pl-6 space-y-3 text-coolGray">
              <li>Enter the product details from Gumroad</li>
              <li>The automation agent processes the image through Cloudinary</li>
              <li>Product data is stored in the migrations table</li>
              <li>An email notification is sent to the user</li>
              <li>The response shows the status of all operations</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AutomationAgent;

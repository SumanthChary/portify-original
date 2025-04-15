
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced workflow steps with more detailed information
const workflowSteps = [
  {
    title: "Webhook Trigger",
    description: "Migration starts when triggered from Portify",
    icon: "🚀",
    details: "n8n webhook receives the Gumroad token and product data from your website.",
    code: `// Node 1: Webhook
// Just configure as a POST endpoint, no code needed
// Path: migrate-gumroad
// HTTP Method: POST
// Response Mode: On Received`
  },
  {
    title: "Fetch Gumroad Products",
    description: "Gets your product data from Gumroad API",
    icon: "📥",
    details: "HTTP GET request to https://api.gumroad.com/v2/products using your access token.",
    code: `// Node 2: HTTP Request (if auto-fetch)
{
  "url": "https://api.gumroad.com/v2/products",
  "method": "GET",
  "authentication": "bearerAuth",
  "bearerToken": "{{$json[\"gumroadToken\"]}}"
}`
  },
  {
    title: "Process Products",
    description: "Prepares each product for migration",
    icon: "⚙️",
    details: "Function node maps through products, extracting title, description, price, and image URL.",
    code: `// Node 3: Function
// If receiving multiple products:
const data = items[0].json.products;
return data.map(product => ({
  json: product
}));

// If handling a single product:
return [{
  json: {
    title: $input.item.json.product.name,
    description: $input.item.json.product.description,
    price: $input.item.json.product.price,
    imageUrl: $input.item.json.product.image
  }
}];`
  },
  {
    title: "Upload Images (Optional)",
    description: "Uploads product images to Cloudinary",
    icon: "🖼️",
    details: "Optional: HTTP POST request to Cloudinary to ensure image persistence.",
    code: `// Node 4: HTTP Request (Cloudinary)
{
  "url": "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
  "method": "POST",
  "body": {
    "file": "{{$json[\"image\"]}}",
    "upload_preset": "YOUR_UPLOAD_PRESET"
  }
}`
  },
  {
    title: "Send to Payhip",
    description: "Creates products in your Payhip account",
    icon: "📤",
    details: "HTTP POST request to Payhip API with product data.",
    code: `// Node 5: HTTP Request (Payhip)
{
  "url": "https://api.payhip.com/v1/products",
  "method": "POST",
  "authentication": "queryAuth",
  "queryParameters": {
    "api_key": "YOUR_PAYHIP_API_KEY"
  },
  "body": {
    "title": "{{$json[\"title\"]}}",
    "description": "{{$json[\"description\"]}}",
    "price": "{{$json[\"price\"]}}",
    "product_image": "{{$json[\"imageUrl\"]}}"
  }
}`
  },
  {
    title: "Notify & Log",
    description: "Updates you and saves migration records",
    icon: "✅",
    details: "Sends email confirmation and logs migration data to a database.",
    code: `// Node 6: Send Email
{
  "to": ["{{$json[\"email\"]}}"],
  "subject": "Product Migration Complete",
  "text": "Your product {{$json[\"title\"]}} has been migrated successfully to Payhip!"
}

// Alternative: Webhook Response
{
  "message": "Product successfully migrated",
  "productName": "{{$json[\"title\"]}}",
  "status": "success"
}`
  },
];

const WorkflowVisualizer = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("visual");
  
  const toggleStep = (index: number) => {
    if (expandedStep === index) {
      setExpandedStep(null);
    } else {
      setExpandedStep(index);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold">n8n Workflow Visualization</h2>
        <p className="text-coolGray">
          Here's how your product migration works behind the scenes
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="visual" className="flex-1 sm:flex-none">Visual Guide</TabsTrigger>
            <TabsTrigger value="code" className="flex-1 sm:flex-none">n8n Code</TabsTrigger>
            <TabsTrigger value="setup" className="flex-1 sm:flex-none">Step-by-Step</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="visual" className="p-6 pt-4">
          <div className="flex flex-col items-center">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center w-full max-w-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-mint/10 text-2xl">
                  {step.icon}
                </div>
                
                <div className="text-center my-2">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-coolGray">{step.description}</p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleStep(index)}
                    className="mt-1 text-coral hover:text-coral/80"
                  >
                    {expandedStep === index ? "Hide Details" : "Show Details"}
                  </Button>
                  
                  {expandedStep === index && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-left text-sm">
                      <p><strong>In n8n:</strong> {step.details}</p>
                    </div>
                  )}
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ArrowDown className="my-2 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="p-6 pt-4">
          <div className="space-y-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-100 p-3 flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-mint/20 mr-3">
                    {step.icon}
                  </div>
                  <h4 className="font-medium">{step.title}</h4>
                </div>
                <div className="p-3">
                  <pre className="bg-slate-800 text-white p-3 rounded text-xs overflow-x-auto">
                    {step.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="setup" className="p-6 pt-4">
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-lg mb-4">How to Set Up Your n8n Workflow</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>Create a new workflow in n8n</strong>
                  <p className="text-sm text-coolGray mt-1">Open your n8n instance and click "New Workflow" or "Create Workflow"</p>
                </li>
                <li>
                  <strong>Add a Webhook node as your trigger</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Configure it with HTTP Method: POST, Path: migrate-gumroad, and Response Mode: On Received
                  </p>
                </li>
                <li>
                  <strong>Add a Function node to process the incoming data</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Use the code examples in the "n8n Code" tab to extract product details
                  </p>
                </li>
                <li>
                  <strong>Add HTTP Request nodes for each external service</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Cloudinary for images (optional), Payhip for creating products
                  </p>
                </li>
                <li>
                  <strong>Add notification nodes</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Email, Slack, or Webhook Response to confirm successful migration
                  </p>
                </li>
                <li>
                  <strong>Test your workflow</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Use the "Execute Workflow" button in n8n and check that data flows correctly
                  </p>
                </li>
                <li>
                  <strong>Activate your webhook</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Click "Execute Node" on the Webhook node to make it active and listening
                  </p>
                </li>
                <li>
                  <strong>Copy the webhook URL</strong>
                  <p className="text-sm text-coolGray mt-1">
                    Paste it into the Webhook URL field on this page
                  </p>
                </li>
              </ol>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Tips for Success</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-coolGray">
                <li>Keep your n8n workflow active while testing the migration</li>
                <li>Use debug nodes in your n8n workflow to see what data is flowing</li>
                <li>Test with one product before migrating everything</li>
                <li>Add error handling to your workflow to handle failed migrations</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowVisualizer;

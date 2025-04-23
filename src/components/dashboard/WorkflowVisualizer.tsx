
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Enhanced workflow steps with more detailed information
const workflowSteps = [
  {
    title: "Webhook Trigger",
    description: "Migration starts when triggered from Portify",
    icon: "🚀",
    details: "n8n webhook receives the Gumroad token, user_id and email from your website."
  },
  {
    title: "Fetch Gumroad Products",
    description: "Gets your product data from Gumroad API",
    icon: "📥",
    details: "HTTP GET request to https://api.gumroad.com/v2/products using your access token."
  },
  {
    title: "Process Products",
    description: "Prepares each product for migration",
    icon: "⚙️",
    details: "Function node maps through products, extracting title, description, price, and image URL."
  },
  {
    title: "Upload Images (Optional)",
    description: "Uploads product images to Cloudinary",
    icon: "🖼️",
    details: "Optional: HTTP POST request to Cloudinary to ensure image persistence."
  },
  {
    title: "Send to Payhip",
    description: "Creates products in your Payhip account",
    icon: "📤",
    details: "HTTP POST request to Payhip API with product data or triggers Lovable browser agent."
  },
  {
    title: "Notify & Log",
    description: "Updates you and saves migration records",
    icon: "✅",
    details: "Sends email confirmation and logs migration data to Supabase for analytics and history."
  },
];

const WorkflowVisualizer = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  const toggleStep = (index: number) => {
    if (expandedStep === index) {
      setExpandedStep(null);
    } else {
      setExpandedStep(index);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold">n8n Workflow Visualization</h2>
        <p className="text-coolGray">
          Here's how your product migration works behind the scenes
        </p>
      </div>
      
      <div className="p-6">
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
        
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-lg mb-2">How to Set Up n8n Webhooks</h3>
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Create a free account at <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">n8n.io</a> or self-host n8n</li>
              <li>Create a new workflow and add a Webhook node as the trigger</li>
              <li>Configure the webhook with HTTP method POST and a custom path (e.g., gumroad-migration)</li>
              <li>Copy the generated webhook URL</li>
              <li>Paste the webhook URL in the input field above</li>
              <li>Add subsequent nodes as shown in the workflow visualization</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizer;

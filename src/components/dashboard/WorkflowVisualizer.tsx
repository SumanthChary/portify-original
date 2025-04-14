
import { ArrowDown } from "lucide-react";

const workflowSteps = [
  {
    title: "Webhook Trigger",
    description: "Migration starts when triggered from Portify",
    icon: "🚀",
  },
  {
    title: "Fetch Gumroad Products",
    description: "Gets your product data from Gumroad API",
    icon: "📥",
  },
  {
    title: "Process Products",
    description: "Prepares each product for migration",
    icon: "⚙️",
  },
  {
    title: "Upload Images (Optional)",
    description: "Uploads product images to Cloudinary",
    icon: "🖼️",
  },
  {
    title: "Send to Payhip",
    description: "Creates products in your Payhip account",
    icon: "📤",
  },
  {
    title: "Notify & Log",
    description: "Updates you and saves migration records",
    icon: "✅",
  },
];

const WorkflowVisualizer = () => {
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
            <div key={index} className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-mint/10 text-2xl">
                {step.icon}
              </div>
              
              <div className="text-center my-2">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-coolGray">{step.description}</p>
              </div>
              
              {index < workflowSteps.length - 1 && (
                <ArrowDown className="my-2 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizer;

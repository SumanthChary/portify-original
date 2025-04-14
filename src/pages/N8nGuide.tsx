
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const N8nGuide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite py-8">
        <div className="section-container">
          <Link to="/dashboard" className="flex items-center text-coolGray hover:text-coral mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6">n8n Workflow Setup Guide</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Getting Started with n8n</h2>
            
            <div className="mb-8">
              <h3 className="font-medium text-xl mb-2">What is n8n?</h3>
              <p className="text-coolGray mb-4">
                n8n is a workflow automation tool that allows you to connect different services
                and automate tasks between them. Think of it as connecting building blocks to
                create a flow of actions that happen automatically.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">Quick Links:</p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li><a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">Sign up for n8n</a></li>
                  <li><a href="https://docs.n8n.io" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">n8n Documentation</a></li>
                </ul>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Step-by-Step Setup</h2>
            
            <div className="space-y-8">
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">1. Create a Webhook Node</h3>
                <p className="text-coolGray mb-2">
                  This is the entry point that receives data from Portify.
                </p>
                <ol className="list-decimal list-inside ml-2">
                  <li>Create a new workflow in n8n</li>
                  <li>Add a "Webhook" node</li>
                  <li>Set HTTP Method to POST</li>
                  <li>Set Path to "gumroad-migration" (or any name)</li>
                  <li>Save the workflow and activate</li>
                  <li>Copy the generated webhook URL</li>
                </ol>
                <div className="mt-2 bg-gray-50 p-3 rounded">
                  <p className="text-xs font-mono">Example webhook URL:</p>
                  <p className="text-xs font-mono text-coral mt-1">https://your-n8n.app/webhook/gumroad-migration</p>
                </div>
              </div>
              
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">2. Add HTTP Request Node to Fetch Gumroad Products</h3>
                <ol className="list-decimal list-inside ml-2">
                  <li>Add an "HTTP Request" node</li>
                  <li>Connect it to the Webhook node</li>
                  <li>Set Method to GET</li>
                  <li>Set URL to https://api.gumroad.com/v2/products</li>
                  <li>Add Authorization Header: Bearer &#123;&#123;$json["gumroadToken"]&#125;&#125;</li>
                </ol>
              </div>
              
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">3. Add Function Node to Process Products</h3>
                <ol className="list-decimal list-inside ml-2">
                  <li>Add a "Function" node</li>
                  <li>Connect it to the HTTP Request node</li>
                  <li>Use the following code:</li>
                </ol>
                <div className="mt-2 bg-gray-800 text-white p-3 rounded overflow-x-auto">
                  <pre className="text-xs">
{`const products = items[0].json.products;
return products.map(product => ({
  json: {
    title: product.name,
    description: product.description,
    price: product.price,
    image: product.preview_url
  }
}));`}
                  </pre>
                </div>
              </div>
              
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">4. (Optional) Add Cloudinary Image Upload</h3>
                <ol className="list-decimal list-inside ml-2">
                  <li>Add another "HTTP Request" node</li>
                  <li>Connect it to the Function node</li>
                  <li>Set Method to POST</li>
                  <li>Set URL to https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload</li>
                  <li>Add form data with file and upload_preset</li>
                </ol>
              </div>
              
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">5. Send to Payhip</h3>
                <ol className="list-decimal list-inside ml-2">
                  <li>Add another "HTTP Request" node</li>
                  <li>Connect it to the previous node</li>
                  <li>Set Method to POST</li>
                  <li>Set URL to Payhip API endpoint or your automation agent</li>
                  <li>Add product data in the JSON body</li>
                </ol>
              </div>
              
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">6. Notify User</h3>
                <ol className="list-decimal list-inside ml-2">
                  <li>Add an "Email" node (or another HTTP Request)</li>
                  <li>Connect it to the Payhip node</li>
                  <li>Configure it to send an email to the user</li>
                  <li>Include details about the migration</li>
                </ol>
              </div>
              
              <div className="border-l-4 border-mint pl-4">
                <h3 className="font-medium text-xl mb-2">7. Log to Database</h3>
                <ol className="list-decimal list-inside ml-2">
                  <li>Add a final HTTP Request or Database node</li>
                  <li>Connect it to the Notification node</li>
                  <li>Configure it to save data to your database</li>
                  <li>Include user ID, products migrated, and timestamp</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-lg mb-2">Tips for Success</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Test each node individually before running the full workflow</li>
                <li>Use n8n's debug panel to inspect data between nodes</li>
                <li>Enable error handling to capture any issues</li>
                <li>Use n8n's scheduling features to retry failed migrations</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
            <p className="text-coolGray mb-4">
              Our team is here to assist you with setting up your n8n workflow.
              Feel free to reach out if you have any questions or need personalized guidance.
            </p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-coral text-white rounded-md hover:bg-coral/90">
                Contact Support
              </button>
              <Link to="/dashboard" className="px-4 py-2 border border-coral text-coral rounded-md hover:bg-coral/10">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default N8nGuide;

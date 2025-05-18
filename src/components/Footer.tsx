import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-darktext text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-coral">port</span>
              <span className="text-white">ify</span>
            </div>
            <p className="text-gray-300 mb-4">
              Move your digital products anywhere, instantly. Easy transfers between platforms with AI assistance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-coral transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-coral transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-coral transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-coral transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-coral transition-colors">Features</a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-coral transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-300 hover:text-coral transition-colors">Testimonials</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">API Status</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">Cookie Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors">GDPR</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Portify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

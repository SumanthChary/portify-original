
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-darktext text-white pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8">
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-coral">port</span>
              <span className="text-white">ify</span>
              <span className="ml-2 px-2 py-1 bg-coral/10 text-xs text-coral rounded-full">Acquisition Ready</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              A complete digital product migration platform ready for acquisition. Skip months of development and launch your SaaS business immediately.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <Button size="sm" className="bg-coral hover:bg-coral/90 text-white gap-2">
                Request Info <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                View Demo
              </Button>
            </div>
            <div className="flex space-x-4 mb-8">
              <a href="#" className="text-gray-400 hover:text-coral transition-colors p-2 bg-white/5 rounded-full">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral transition-colors p-2 bg-white/5 rounded-full">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral transition-colors p-2 bg-white/5 rounded-full">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral transition-colors p-2 bg-white/5 rounded-full">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-coral">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Home
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Features
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Pricing
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Testimonials
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-coral">For Buyers</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Acquisition Details
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Technical Documentation
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Financial Projections
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-coral transition-colors flex items-center gap-1 group">
                  Due Diligence
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-coral">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-coral mr-3 mt-0.5" />
                <a href="mailto:acquisition@portify.com" className="text-gray-300 hover:text-white">acquisition@portify.com</a>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-coral mr-3 mt-0.5" />
                <a href="tel:+15557891234" className="text-gray-300 hover:text-white">+1 (555) 789-1234</a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-coral mr-3 mt-0.5" />
                <span className="text-gray-300">San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; {currentYear} Portify. All rights reserved.
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-coral transition-colors">Privacy Policy</a>
            <span className="text-gray-600">•</span>
            <a href="#" className="hover:text-coral transition-colors">Terms of Service</a>
            <span className="text-gray-600">•</span>
            <a href="#" className="hover:text-coral transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

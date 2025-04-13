
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="text-coral">port</span>
              <span className="text-darktext">ify</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="font-medium text-gray-700 hover:text-coral transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="font-medium text-gray-700 hover:text-coral transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="font-medium text-gray-700 hover:text-coral transition-colors">
              Pricing
            </a>
            <Button variant="outline" className="border-coral text-coral hover:text-white hover:bg-coral">
              Login
            </Button>
            <Button className="bg-cta-gradient hover:opacity-90">
              Start Free
            </Button>
          </nav>
          
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <a href="#features" className="block font-medium text-gray-700 hover:text-coral py-2">
              Features
            </a>
            <a href="#how-it-works" className="block font-medium text-gray-700 hover:text-coral py-2">
              How It Works
            </a>
            <a href="#pricing" className="block font-medium text-gray-700 hover:text-coral py-2">
              Pricing
            </a>
            <div className="pt-2 flex flex-col space-y-3">
              <Button variant="outline" className="w-full border-coral text-coral hover:text-white hover:bg-coral">
                Login
              </Button>
              <Button className="w-full bg-cta-gradient hover:opacity-90">
                Start Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer" 
            onClick={() => navigate('/')}
          >
            {/* Logo section - currently empty as requested */}
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-coolGray hover:text-coral transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="text-coolGray hover:text-coral transition-colors"
            >
              Products
            </button>
            <button 
              onClick={() => navigate('/automation')}
              className="text-coolGray hover:text-coral transition-colors"
            >
              Automation
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="text-coolGray hover:text-coral transition-colors"
            >
              Account
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-cta-gradient hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

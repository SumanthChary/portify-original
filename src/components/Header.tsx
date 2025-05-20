
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-coral">port</span>
              <span className="text-darktext">ify</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className={`font-medium transition-colors ${isActive('/products') ? 'text-coral' : 'text-gray-700 hover:text-coral'}`}>
              Products
            </Link>
            <a href="#features" className="font-medium text-gray-700 hover:text-coral transition-colors">
              Features
            </a>
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant={isActive('/dashboard') ? "default" : "outline"} 
                    className={isActive('/dashboard') ? "bg-coral" : "border-coral text-coral hover:text-white hover:bg-coral"}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  className="bg-cta-gradient hover:opacity-90"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="border-coral text-coral hover:text-white hover:bg-coral">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-cta-gradient hover:opacity-90">
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </nav>
          
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-slideUp">
            <Link to="/products" className={`block font-medium py-2 ${isActive('/products') ? 'text-coral' : 'text-gray-700 hover:text-coral'}`}>
              Products
            </Link>
            <a href="#features" className="block font-medium text-gray-700 hover:text-coral py-2">
              Features
            </a>
            <a href="#pricing" className="block font-medium text-gray-700 hover:text-coral py-2">
              Pricing
            </a>
            <div className="pt-2 flex flex-col space-y-3">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full border-coral text-coral hover:text-white hover:bg-coral">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    className="w-full bg-cta-gradient hover:opacity-90"
                    onClick={() => signOut()}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full border-coral text-coral hover:text-white hover:bg-coral">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="w-full bg-cta-gradient hover:opacity-90">
                      Start Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const headerClasses = scrolled 
    ? "bg-white/90 shadow-lg backdrop-blur-md border-b border-gray-100" 
    : "bg-transparent";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${headerClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold flex items-center">
              <span className="text-coral">port</span>
              <span className={scrolled ? "text-darktext" : "text-darktext"}>ify</span>
              <span className="ml-2 px-1.5 py-0.5 bg-coral/10 text-[10px] text-coral rounded-full hidden sm:inline-block">
                Acquisition Ready
              </span>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-1">
            <div className="relative group px-3 py-2">
              <button className="flex items-center font-medium transition-colors text-gray-700 hover:text-coral">
                Platform <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
              </button>
              <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left">
                <div className="backdrop-blur-xl bg-white/90 border border-gray-100 shadow-xl rounded-xl p-2">
                  <Link to="/products" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Products</div>
                    <div className="text-sm text-gray-500">Browse our catalog</div>
                  </Link>
                  <a href="#features" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Features</div>
                    <div className="text-sm text-gray-500">Explore capabilities</div>
                  </a>
                  <a href="#pricing" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Pricing</div>
                    <div className="text-sm text-gray-500">Subscription plans</div>
                  </a>
                </div>
              </div>
            </div>

            <div className="relative group px-3 py-2">
              <button className="flex items-center font-medium transition-colors text-gray-700 hover:text-coral">
                For Buyers <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
              </button>
              <div className="absolute left-0 mt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left">
                <div className="backdrop-blur-xl bg-white/90 border border-gray-100 shadow-xl rounded-xl p-2">
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Acquisition Details</div>
                    <div className="text-sm text-gray-500">Investment opportunity</div>
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                    <div className="font-medium">Technical Documentation</div>
                    <div className="text-sm text-gray-500">System architecture</div>
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-coral">
                    <div className="font-medium flex items-center">
                      Request NDA <ArrowUpRight className="h-3 w-3 ml-1" />
                    </div>
                    <div className="text-sm text-gray-500">For serious inquiries</div>
                  </a>
                </div>
              </div>
            </div>
            
            <a href="#testimonials" className="px-3 py-2 font-medium text-gray-700 hover:text-coral transition-colors">
              Testimonials
            </a>
            
            <a href="#" className="px-3 py-2 font-medium text-gray-700 hover:text-coral transition-colors">
              Contact
            </a>

            <div className="ml-4">
              {user ? (
                <div className="flex items-center space-x-4">
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
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/auth">
                    <Button variant="outline" className="border-coral text-coral hover:text-white hover:bg-coral">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-cta-gradient hover:opacity-90">
                      Explore Demo
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
          
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            className="lg:hidden py-4 space-y-3 bg-white rounded-lg shadow-lg border border-gray-100 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-2">
              <div className="font-medium mb-1">Platform</div>
              <div className="ml-2 space-y-1">
                <Link to="/products" className="block py-1 text-gray-700 hover:text-coral">Products</Link>
                <a href="#features" className="block py-1 text-gray-700 hover:text-coral">Features</a>
                <a href="#pricing" className="block py-1 text-gray-700 hover:text-coral">Pricing</a>
              </div>
            </div>

            <div className="px-4 py-2">
              <div className="font-medium mb-1">For Buyers</div>
              <div className="ml-2 space-y-1">
                <a href="#" className="block py-1 text-gray-700 hover:text-coral">Acquisition Details</a>
                <a href="#" className="block py-1 text-gray-700 hover:text-coral">Technical Documentation</a>
                <a href="#" className="block py-1 text-gray-700 hover:text-coral">Request NDA</a>
              </div>
            </div>
            
            <a href="#testimonials" className="block px-4 py-2 font-medium text-gray-700 hover:text-coral">
              Testimonials
            </a>
            
            <a href="#" className="block px-4 py-2 font-medium text-gray-700 hover:text-coral">
              Contact
            </a>
            
            <div className="pt-2 px-4 flex flex-col space-y-3">
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
                      Explore Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;

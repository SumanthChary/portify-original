
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-coral" />
            <span className="text-2xl font-bold bg-gradient-to-r from-coral to-redAccent bg-clip-text text-transparent">
              Portify
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'text-coral' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'text-coral' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/enhanced-dashboard" 
              className={`nav-link ${isActive('/enhanced-dashboard') ? 'text-coral' : ''}`}
            >
              Enhanced Migration
            </Link>
            <Link 
              to="/migrated-products" 
              className={`nav-link ${isActive('/migrated-products') ? 'text-coral' : ''}`}
            >
              Products
            </Link>
            <Link 
              to="/automation-agent" 
              className={`nav-link ${isActive('/automation-agent') ? 'text-coral' : ''}`}
            >
              Agent
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/enhanced-dashboard">
              <Button className="bg-cta-gradient hover:opacity-90">
                Try Free Migration
              </Button>
            </Link>
          </div>
          
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/enhanced-dashboard" className="nav-link">Enhanced Migration</Link>
              <Link to="/migrated-products" className="nav-link">Products</Link>
              <Link to="/automation-agent" className="nav-link">Agent</Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/enhanced-dashboard">
                  <Button className="w-full bg-cta-gradient hover:opacity-90">
                    Try Free Migration
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

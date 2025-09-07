
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: "/", label: "Home" },
    { path: "/migrate", label: "Migration Wizard" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/migrated-products", label: "Products" },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMenu}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent">
              <img
                src="/lovable-uploads/094a81bc-7698-41d3-ae82-021dcb51413b.png"
                alt="Portify Logo"
                className="w-10 h-10 object-contain rounded-xl"
                style={{ background: 'transparent' }}
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-coral to-redAccent bg-clip-text text-transparent">
              Portify
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'bg-coral/10 text-coral' 
                    : 'text-coolGray hover:text-darktext hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-coolGray">Welcome, {user.email}</span>
                <Link to="/migrate">
                  <Button className="bg-cta-gradient hover:opacity-90 text-white shadow-lg">
                    Start Migration
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    Sign In
                  </Button>
                </Link>
                <Link to="/migrate">
                  <Button className="bg-cta-gradient hover:opacity-90 text-white shadow-lg">
                    Try Free Migration
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-darktext" />
            ) : (
              <Menu className="h-6 w-6 text-darktext" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
            <div className="py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-coral/10 text-coral' 
                      : 'text-coolGray hover:text-darktext hover:bg-gray-50'
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 text-sm text-coolGray">
                      Welcome, {user.email}
                    </div>
                    <Link to="/migrate" onClick={closeMenu}>
                      <Button className="w-full bg-cta-gradient hover:opacity-90 text-white shadow-lg">
                        Start Migration
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/auth" onClick={closeMenu}>
                      <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/migrate" onClick={closeMenu}>
                      <Button className="w-full bg-cta-gradient hover:opacity-90 text-white shadow-lg">
                        Try Free Migration
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


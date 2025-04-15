
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-coral">port</span>
              <span className="text-darktext">ify</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="font-medium text-gray-700 hover:text-coral transition-colors">
              Features
            </Link>
            <Link to="/#how-it-works" className="font-medium text-gray-700 hover:text-coral transition-colors">
              How It Works
            </Link>
            <Link to="/#pricing" className="font-medium text-gray-700 hover:text-coral transition-colors">
              Pricing
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="font-medium text-gray-700 hover:text-coral transition-colors">
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.username} />
                    ) : (
                      <AvatarFallback>
                        {profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-coral text-coral hover:text-white hover:bg-coral">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
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
          <div className="md:hidden py-4 space-y-3">
            <Link to="/#features" className="block font-medium text-gray-700 hover:text-coral py-2">
              Features
            </Link>
            <Link to="/#how-it-works" className="block font-medium text-gray-700 hover:text-coral py-2">
              How It Works
            </Link>
            <Link to="/#pricing" className="block font-medium text-gray-700 hover:text-coral py-2">
              Pricing
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="block font-medium text-gray-700 hover:text-coral py-2">
                  Dashboard
                </Link>
                <Link to="/profile" className="block font-medium text-gray-700 hover:text-coral py-2">
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <div className="pt-2 flex flex-col space-y-3">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full border-coral text-coral hover:text-white hover:bg-coral">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button className="w-full bg-cta-gradient hover:opacity-90">
                    Start Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

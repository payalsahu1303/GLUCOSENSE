import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, X, LayoutDashboard, Clock, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import logo from "@/assets/image.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track auth state

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
    },
    {
      label: "History",
      path: "/history",
      icon: <Clock className="w-5 h-5 mr-2" />,
    },
    {
      label: "Contact",
      path: "/contact",
      icon: <Phone className="w-5 h-5 mr-2" />,
    },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        const img = localStorage.getItem("profileImage");
        const name = localStorage.getItem("profileName");
        if (img) setProfileImage(img);
        if (name) setProfileName(name);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.removeItem("profileImage");
      localStorage.removeItem("profileName");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <nav className="px-4 py-4 bg-white shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-black">
            <img src={logo} alt="GlucoSense Logo" className="rounded w-7 h-7" />
            <span>GlucoSense</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Desktop Links */}
          <div className="items-center hidden gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-black underline"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Conditionally render the Logout button */}
            {isAuthenticated && (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            )}

            {/* Desktop Avatar (Icon Only) */}
            {profileImage && (
              <Avatar className="ml-4">
                <AvatarImage src={profileImage} alt="User" />
                <AvatarFallback>{profileName?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="flex flex-col gap-3 px-2 mt-4 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? "text-black bg-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
            {/* Conditionally render the Logout button */}
            {isAuthenticated && (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            )}

            {/* Mobile Avatar + Name */}
            {profileImage && (
              <div className="flex items-center gap-3 p-3 mt-4 bg-gray-100 rounded-lg">
                <Avatar>
                  <AvatarImage src={profileImage} alt="User" />
                  <AvatarFallback>{profileName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{profileName}</div>
              </div>
            )}
          </div>
        )}
      </nav>
      <Separator />
    </>
  );
};

export default Navbar;

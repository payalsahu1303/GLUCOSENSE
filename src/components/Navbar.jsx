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

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
      requiresAuth: true,
    },
    {
      label: "History",
      path: "/history",
      icon: <Clock className="w-5 h-5 mr-2" />,
      requiresAuth: true,
    },
    {
      label: "Contact",
      path: "/contact",
      icon: <Phone className="w-5 h-5 mr-2" />,
      requiresAuth: true,
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
        setProfileImage(null);
        setProfileName("");
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
      {/*
        IMPORTANT: Placing full-screen background elements here will likely NOT produce
        the desired effect as they will be contained and clipped by the 'nav' element.
        These types of backgrounds typically belong in a root layout component or the
        specific page component (like Login) where they are meant to be a full-page background.
      */}
      <nav className="relative px-4 py-4 overflow-hidden bg-white shadow-sm"> {/* Added relative & overflow-hidden to nav */}
        {/* Background shapes - If you insist on placing them here */}
        {/*
          Note: These blobs will only appear within the bounds of the navbar.
          You might need to adjust sizes and positions dramatically to make
          them visible or useful within such a confined space.
          Their original purpose was for a full-screen background.
        */}
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-gradient-to-br from-[#c8e6f5] to-[#a2d9f7] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob z-0"></div>
        <div className="absolute top-[20%] right-[5%] w-56 h-56 sm:w-72 sm:h-72 lg:w-[350px] lg:h-[350px] bg-gradient-to-br from-[#d4edda] to-[#88d6b8] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute bottom-[5%] left-[10%] w-48 h-48 sm:w-64 sm:h-64 lg:w-[300px] lg:h-[300px] bg-gradient-to-br from-[#fbe3e6] to-[#f6a6b2] rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000 z-0"></div>

        {/* Ensure all actual navbar content has a higher z-index */}
        <div className="relative z-10 flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo - always present */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-black">
            <img src={logo} alt="GlucoSense Logo" className="rounded w-7 h-7" />
            <span>GlucoSense</span>
          </Link>

          {/* If on auth page, show simple links or nothing else */}
          {isAuthPage ? (
            <div className="hidden md:flex">
              {location.pathname === "/login" && (
                <Link to="/register" className="text-sm font-medium text-gray-600 hover:text-black">
                  Register
                </Link>
              )}
              {location.pathname === "/register" && (
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black">
                  Login
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Menu Button - only if not on auth page */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={toggleMenu}>
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </div>

              {/* Desktop Links - only if not on auth page */}
              <div className="items-center hidden gap-6 md:flex">
                {navItems.map((item) => (
                  (!item.requiresAuth || isAuthenticated) && (
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
                  )
                ))}

                {isAuthenticated && (
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                )}

                {profileImage && (
                  <Avatar className="ml-4">
                    <AvatarImage src={profileImage} alt="User" />
                    <AvatarFallback>{profileName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Dropdown - only if not on auth page */}
        {isOpen && !isAuthPage && (
          <div className="relative z-10 flex flex-col gap-3 px-2 mt-4 md:hidden">
            {navItems.map((item) => (
               (!item.requiresAuth || isAuthenticated) && (
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
              )
            ))}
            {isAuthenticated && (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            )}

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
      {!isAuthPage && <Separator />}
    </>
  );
};

export default Navbar;
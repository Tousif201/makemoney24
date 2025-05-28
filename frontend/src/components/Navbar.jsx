import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/makemoney.png";
import { Menu, User, X, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { CartSheet } from "./Carts";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, [location.pathname]); // Update login state on route change

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-md z-50 sticky top-0">
      <div className="w-full max-w-7xl mx-auto py-2 px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="w-14 h-14 object-contain" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden sm:flex items-center space-x-6">
          <Link
            to="/products"
            className="hover:underline font-medium text-gray-700"
          >
            Products
          </Link>
          <Link
            to="/services"
            className="hover:underline font-medium text-gray-700"
          >
            Services
          </Link>
        </nav>
        {/* Auth Buttons / User */}
        <div className="hidden sm:flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              <CartSheet />
              <Link to="/dashboard">
                <Button
                  variant="icon"
                  onClick={() => navigate("/dashboard")}
                  className="hover:text-purple-600"
                >
                  <User className="" size={18} />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1 rounded text-white border bg-[#B641FF] hover:bg-purple-700 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1 rounded text-white bg-[#B641FF] hover:bg-purple-700 transition"
              >
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex justify-center items-center space-x-4">
          <CartSheet />

          <button
            className="sm:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t px-4 pb-4 space-y-3">
          <Link to="/products" className="block text-gray-700 hover:underline">
            Products
          </Link>
          <Link to="/services" className="block text-gray-700 hover:underline">
            Services
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="block text-gray-700 hover:underline"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-[#B641FF] hover:underline"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block text-white bg-[#B641FF] px-3 py-1 rounded hover:bg-purple-400"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

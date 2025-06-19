import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/makemoney.png";
import {
  Menu,
  User,
  X,
  LogOut,
  ChevronRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { CartSheet } from "./Carts";

// Shadcn Dropdown Menu Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

// Shadcn ScrollArea Import
import { ScrollArea } from "@/components/ui/scroll-area";

// Shadcn Tooltip Imports
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import API for categories
import { getCategoriesWithSubcategories } from "../../api/categories";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu open/close
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Category state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // Mobile menu expanded category (for subcategories)
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);

  // Check login status on route change
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setMobileExpandedCategory(null); // Also collapse any expanded category
  }, [location.pathname]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setLoadingCategories(true);
        setErrorCategories(null);
        const fetchedCats = await getCategoriesWithSubcategories();
        setCategories(fetchedCats);
      } catch (err) {
        console.error("Error fetching categories for Navbar:", err);
        setErrorCategories("Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchAllCategories();
  }, []);

  // Handler for mobile menu category expansion
  const handleMobileCategoryToggle = useCallback((categoryId) => {
    setMobileExpandedCategory((prevId) =>
      prevId === categoryId ? null : categoryId
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/login"); // Redirect to login page after logout
  };

  const NavLinkItem = ({ to, children, className = "", onClick }) => (
    <Link
      to={to}
      className={`relative font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200 group ${className}`}
      onClick={onClick} // Pass onClick directly
    >
      {children}
      {/* Underline effect */}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );

  return (
    <header className="bg-white shadow-sm z-50 sticky top-0 border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto py-2 px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 py-1">
          <img
            src={logo}
            alt="MakeMoney Logo"
            className="w-14 h-14 object-contain"
          />
          <span className="text-2xl font-extrabold text-gray-800 hidden sm:block tracking-tight">
            MakeMoney
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden sm:flex items-center space-x-8">
          <NavLinkItem to="/">Products</NavLinkItem>
          <NavLinkItem to="/services">Services</NavLinkItem>
          {/* Browse Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group relative font-medium text-gray-700 hover:bg-transparent hover:text-purple-600 transition-colors duration-200 text-base px-0"
              >
                Browse
                <ChevronDown className="ml-1 h-4 w-4 transform transition-transform duration-200 group-data-[state=open]:rotate-180" />
                {/* Underline effect */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full group-data-[state=open]:w-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 shadow-lg rounded-md border border-gray-100 bg-white z-[60]">
              {loadingCategories ? (
                <DropdownMenuItem className="text-gray-500 cursor-not-allowed">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  Categories...
                </DropdownMenuItem>
              ) : errorCategories ? (
                <DropdownMenuItem className="text-red-500 cursor-not-allowed">
                  {errorCategories}
                </DropdownMenuItem>
              ) : categories.length === 0 ? (
                <DropdownMenuItem className="text-gray-500 cursor-not-allowed">
                  No categories found.
                </DropdownMenuItem>
              ) : (
                <ScrollArea className="h-auto max-h-80 pr-2">
                  {" "}
                  {categories.map((category) =>
                    category.children && category.children.length > 0 ? (
                      <DropdownMenuSub key={category._id}>
                        <DropdownMenuSubTrigger className="flex items-center justify-between text-gray-700 hover:bg-gray-50 hover:text-purple-600 focus:bg-gray-50 focus:text-purple-600 transition-colors duration-150 rounded px-2 py-1.5 cursor-pointer">
                          <span className="flex-1">{category.name}</span>
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-500 group-hover:text-purple-600 transition-transform duration-150" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-64 p-2 shadow-lg rounded-md border border-gray-100 bg-white z-[65]">
                          <ScrollArea className="h-auto max-h-80 pr-2">
                            {" "}
                            {category.children.map((subCategory) => (
                              <DropdownMenuItem key={subCategory._id} asChild>
                                <Link
                                  to={`/browse?categories=${subCategory._id}`}
                                  className="block text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors duration-150 rounded px-2 py-1.5"
                                >
                                  {subCategory.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </ScrollArea>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ) : (
                      <DropdownMenuItem key={category._id} asChild>
                        <Link
                          to={`/browse?categories=${category._id}`}
                          className="block text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors duration-150 rounded px-2 py-1.5"
                        >
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    )
                  )}
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLinkItem to="/about">About</NavLinkItem>
        </nav>

        {/* Auth Buttons / User */}
        <div className="hidden sm:flex items-center space-x-3">
          <TooltipProvider>
            {isLoggedIn ? (
              <>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <CartSheet />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Cart</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link to="/dashboard">
                      <Button
                        variant="ghost"
                        className="hover:bg-gray-100 text-gray-700 hover:text-purple-600 transition-colors duration-200 p-2 rounded-full"
                      >
                        <User size={20} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dashboard</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 p-2 rounded-full"
                    >
                      <LogOut size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-md text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md text-sm font-semibold"
                >
                  Signup
                </Link>
              </>
            )}
          </TooltipProvider>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex justify-center items-center space-x-4">
          <CartSheet />
          {isLoggedIn && (
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="p-2 rounded-full text-gray-700"
                title="Dashboard"
              >
                <User size={20} />
              </Button>
            </Link>
          )}
          <button
            className="sm:hidden text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 shadow-lg animate-slideIn">
          {/* Explicit Mobile Nav Links for consistency */}
          <NavLinkItem
            to="/"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
            Products
          </NavLinkItem>
          <NavLinkItem
            to="/services"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
            Services
          </NavLinkItem>

          {/* Browse Section for Mobile */}
          <div className="border-b pb-3 mb-3 border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-between text-lg font-semibold text-gray-800 hover:bg-gray-50 px-0 rounded-none"
              onClick={() => handleMobileCategoryToggle("browse-main")}
            >
              Browse
              {mobileExpandedCategory === "browse-main" ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            {mobileExpandedCategory === "browse-main" && (
              <div className="mt-2 space-y-2 pl-4 border-l border-gray-200">
                {loadingCategories ? (
                  <div className="text-gray-500 flex items-center py-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                    Categories...
                  </div>
                ) : errorCategories ? (
                  <div className="text-red-500 py-2">{errorCategories}</div>
                ) : categories.length === 0 ? (
                  <div className="text-gray-500 py-2">No categories found.</div>
                ) : (
                  <ScrollArea className="h-72">
                    {categories.map((category) => (
                      <div key={category._id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-base text-gray-700 hover:bg-gray-50 px-0 rounded-none"
                          onClick={() =>
                            handleMobileCategoryToggle(category._id)
                          }
                        >
                          {category.name}
                          {category.children &&
                            category.children.length > 0 &&
                            (mobileExpandedCategory === category._id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            ))}
                        </Button>
                        {mobileExpandedCategory === category._id &&
                          category.children &&
                          category.children.length > 0 && (
                            <div className="mt-2 space-y-2 pl-4 border-l border-gray-200">
                              {category.children.map((subCategory) => (
                                <Link
                                  key={subCategory._id}
                                  to={`/browse?categories=${subCategory._id}`}
                                  className="block text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm py-1.5"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subCategory.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        {/* If a category has no children, render it as a direct link */}
                        {(!category.children ||
                          category.children.length === 0) && (
                          <Link
                            to={`/browse?categories=${category._id}`}
                            className="block text-gray-700 hover:text-purple-600 transition-colors duration-200 text-base py-1.5"
                            onClick={() => setIsOpen(false)}
                          >
                            {category.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                )}
                {categories.length > 0 && (
                  <Link
                    to="/browse"
                    className="block text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 text-base py-1.5 mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Browse Items
                  </Link>
                )}
              </div>
            )}
          </div>

          <NavLinkItem
            to="/about"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
            About
          </NavLinkItem>

           <NavLinkItem
            to="/buisness-plan"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
            Business Plan
          </NavLinkItem>
            <NavLinkItem
            to="/tnc"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
             Terms & Conditions
          </NavLinkItem>
            <NavLinkItem
            to="/privacy-policy"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
            Privacy Policy
          </NavLinkItem>
            <NavLinkItem
            to="/company-policy"
            className="block text-gray-700 hover:text-purple-600 text-lg py-2"
            onClick={() => setIsOpen(false)} // Close menu on click
          >
           Company Policy
          </NavLinkItem>



          {isLoggedIn ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-lg font-semibold text-red-600 hover:bg-red-50 py-2 mt-4 rounded-none"
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link
                to="/login"
                className="block text-center px-5 py-2 rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-md font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block text-center px-5 py-2 rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

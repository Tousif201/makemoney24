import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useState } from 'react';
import { Menu, X } from 'lucide-react'; // install with: npm install lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Optional text */}logo
          {/* <span className="text-xl font-bold">MyBrand</span> */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="space-x-6 hidden sm:flex">
          <Link to="/products" className="hover:underline font-medium text-gray-700">Products</Link>
          <Link to="/services" className="hover:underline font-medium text-gray-700">Services</Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="sm:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden px-4 pb-3 space-y-2">
          <Link to="/products" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:underline">Products</Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:underline">Services</Link>
        </div>
      )}
    </header>
  );
}

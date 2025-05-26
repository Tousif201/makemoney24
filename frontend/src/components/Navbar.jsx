import { Link } from 'react-router-dom';
import logo from '../assets/makemoney.png';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-2 px-2 sm:px-4 flex justify-between items-center">
        {/* Logo (more to the left) */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="w-[3rem] h-[3rem]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-3">
          <Link to="/products" className="hover:underline font-medium text-gray-700">Products</Link>
          <Link to="/services" className="hover:underline font-medium text-gray-700">Services</Link>
          <Link to="/login" className="px-4 py-1 rounded text-white border bg-[#B641FF] hover:bg-blue-100 transition">Login</Link>
          <Link to="/signup" className="px-4 py-1 rounded text-white bg-[#B641FF] hover:bg-blue-700 transition">Signup</Link>
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
          <Link to="/login" onClick={() => setIsOpen(false)} className="block text-[#B641FF] hover:underline">Login</Link>
          <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-white bg-[#B641FF] px-3 py-1 rounded hover:bg-blue-700">Signup</Link>
        </div>
      )}
    </header>
  );
}

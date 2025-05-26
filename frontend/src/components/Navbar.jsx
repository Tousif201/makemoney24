import { Link } from 'react-router-dom';
import logo from '../assets/makemoney.png';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const session = localStorage.getItem("authToken")
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-2 px-2 sm:px-4 flex justify-between ">
        {/* Logo - Left */}
        <div className="flex items-center  space-x-2">
          <Link to="/">
            <img src={logo} alt="logo" className="w-[4rem] h-[4rem]" />
          </Link>
        </div>

        {/* Center Nav Links */}
        <div className="hidden sm:flex items-center space-x-6">
          <Link to="/products" className="hover:underline font-medium text-gray-700">Products</Link>
          <Link to="/services" className="hover:underline font-medium text-gray-700">Services</Link>
        </div>

        {/* Login/Signup - Right */}
        {session ?
          <div>
            Dashboard
          </div> :
          <div className="hidden sm:flex items-center space-x-2">
            <Link to="/login" className="px-4 py-1 rounded text-white border bg-[#B641FF] hover:bg-purple-700 transition">Login</Link>
            <Link to="/signup" className="px-4 py-1 rounded text-white bg-[#B641FF] hover:bg-purple-700 transition">Signup</Link>
          </div>
        }

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
          <Link to="/login" onClick={() => setIsOpen(false)} className="block text-[#B641FF] hover:bg-[#B641FF]">Login</Link>
          <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-white bg-[#B641FF] px-3 py-1 rounded hover:bg-purple-400">Signup</Link>
        </div>
      )}
    </header>
  );
}

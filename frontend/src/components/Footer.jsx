import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <Link
              to="/"
              className="text-2xl font-bold text-white hover:text-indigo-400 transition"
            >
              MakeMoney24 Private Limited
            </Link>

            <address className="not-italic text-gray-400 text-sm leading-relaxed">
              Shree Labh Enterprises <br />
              Niramay Hospital Back Side <br />
              Railway Station Road <br />
              Jalna - 431203 <br />
              Maharashtra, India
            </address>

            <p className="text-gray-400 text-sm">
              Mobile: <a href="tel:+919876543210" className="hover:text-white">+91-98765 43210</a><br />
              Email: <a href="mailto:contact@makemoney24.com" className="hover:text-white">contact@makemoney24.com</a>
            </p>

            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.instagram.com/your_makemoney24_instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com/your_makemoney24_twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.youtube.com/your_makemoney24_youtube"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-600 transition"
                aria-label="Youtube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="mailto:contact@makemoney24.com"
                className="text-gray-400 hover:text-yellow-400 transition"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Policy Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company Policy</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/buisness-plan" className="hover:text-white">Business Plan</Link>
              </li>
              <li>
                <Link to="/tnc" className="hover:text-white">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/company-policy" className="hover:text-white">Company Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>© 2025 MakeMoney24 Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

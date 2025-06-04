import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 px-9">
      <div className="container-custom py-12">
        {" "}
        {/* Ensure 'container-custom' class is defined in your CSS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:gap-5 gap-5">
          <div className="space-y-2">
            <Link to="/" className="md:text-xl text-lg font-bold text-white">
              MakeMoney24 Private Limited,
            </Link>

            <p className="text-gray-400 text-sm md:text-base">
              {/* Placeholder Address for MakeMoney24 Private Limited, Bhopal */}
              <span>Building No./Flat No.:</span> F-12
              <br />
              <span>Road/Street:</span> Hoshangabad Road
              <br />
              <span>Locality/Sub Locality:</span> Arera Hills
              <br />
              <span>City/Town/Village:</span> Bhopal
              <br />
              <span>District:</span> Bhopal
              <br />
              <span>State:</span> Madhya Pradesh
              <br />
              <span>PIN Code:</span> 462011
            </p>

            <p className="text-gray-400 text-sm md:text-base">
              {/* Placeholder Corporate Info */}
              CIN: U74999MP2025PTCXXXXXX <br />
              GSTIN: 23ABCDE1234F1Z5 <br />
              Mobile: +91-98765 43210 <br />
              Email: contact@makemoney24.com <br />
            </p>

            <div className="flex space-x-4 pt-2">
              {/* IMPORTANT: Update these hrefs with your actual social media links */}
              <a
                href="https://www.instagram.com/your_makemoney24_instagram" // REPLACE WITH ACTUAL LINK
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com/your_makemoney24_twitter" // REPLACE WITH ACTUAL LINK
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.youtube.com/your_makemoney24_youtube" // REPLACE WITH ACTUAL LINK
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-600 transition"
                aria-label="Youtube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="mailto:contact@makemoney24.com" // REPLACE WITH ACTUAL EMAIL IF DIFFERENT
                className="text-gray-400 hover:text-orange-400 transition"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Corporate Info
            </h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li>
                <Link to="#">Our Brand</Link>
              </li>
              <li>
                <Link to="#">Transparency</Link>
              </li>
              {/* IMPORTANT: Ensure these PDF paths are correct or update them */}
              <li>
                <a
                  href="/pdfs/makemoney24-incentive-plan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Incentive Plan
                </a>
              </li>
              <li>
                <a
                  href="/pdfs/makemoney24-rewards.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rewards
                </a>
              </li>
              <li>
                <a
                  href="/pdfs/makemoney24-compliance-documents.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Compliance Documents
                </a>
              </li>
              <li>
                <Link to="#">Benefits of Working</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li>
                <Link to="#">FAQ</Link>
              </li>
              <li>
                <Link to="#">Mission, Vision & Values</Link>
              </li>
              <li>
                <Link to="#">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Company Policy
            </h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-400">
              <li>
                <Link to="#">Business Plan</Link>
              </li>
              <li>
                <Link to="#">Return Policy</Link>
              </li>
              <li>
                <Link to="#">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="#">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#">Promotion of Distributor</Link>
              </li>
              <li>
                <Link to="#">Code of Conduct</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 MakeMoney24 Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 px-9">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:gap-5 gap-5">
          <div className="space-y-2">
            <Link to="/" className="md:text-xl text-lg font-bold text-white">
              Aetheric Dynamics MKT Private Limited,
            </Link>

            <p className='text-gray-400 text-sm md:text-base'>
              <span>Building No./Flat No.:</span> Dewas Naka<br />
              <span>Road/Street:</span> LASUDIYA MORI<br />
              <span>Locality/Sub Locality:</span> 88/2/2/4 SINGHAL COMPOUND<br />
              <span>City/Town/Village:</span> Indore<br />
              <span>District:</span> Indore<br />
              <span>State:</span> Madhya Pradesh<br />
              <span>PIN Code:</span> 452010
            </p>

            <p className="text-gray-400 text-sm md:text-base">
              CIN: U14101AS2024PTC026780 <br />
              GSTIN: 23ABBCA1033C1ZO <br />
              Mobile: +91-89649 69960 <br />
              Email: admcare9@gmail.com <br />
            </p>

            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.instagram.com/aetheric_dynamics?igsh=ZDA5dmlxbnk2Ymlm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-300 transition flex items-center gap-3 text-sm md:text-base"
              >
                <Instagram size={20} />
                <Twitter size={20} />
                <Youtube size={20} />
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Corporate Info</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link to="#">Our Brand</Link></li>
              <li><Link to="#">Transparency</Link></li>
              <li><a href="/pdfs/adm ppt.pdf" target="_blank" rel="noopener noreferrer">Incentive Plan</a></li>
              <li><a href="/pdfs/adm ppt.pdf" target="_blank" rel="noopener noreferrer">Rewards</a></li>
              <li><a href="/pdfs/Certificates.pdf" target="_blank" rel="noopener noreferrer">Compliance Documents</a></li>
              <li><Link to="#">Benefits of working</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link to="#">FAQ</Link></li>
              <li><Link to="#">Mission, Vision & Values</Link></li>
              <li><Link to="#">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company Policy</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link to="#">Business Plan</Link></li>
              <li><Link to="#">Return Policy</Link></li>
              <li><Link to="#">Terms & Conditions</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Promotion of Distributor</Link></li>
              <li><Link to="#">Code of Conduct</Link></li>
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

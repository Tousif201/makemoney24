import { Toaster } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children} </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}

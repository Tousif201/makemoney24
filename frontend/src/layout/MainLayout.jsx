import { Outlet } from "react-router-dom";
import Navbar from "../Component/Navbar"; 
import  Footer from "../Component/Footer"

export default function MainLayout() {
  return (
    <div>
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
     <Footer/>
    </div>
  );
}

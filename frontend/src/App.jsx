import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import routes from "./routes/routes"; // 👈 import routes array
import "./index.css";
import { SessionProvider } from "./context/SessionContext";
import { CartProvider } from "./context/CartContext";
export default function App() {
  return (
    <Router>
      <SessionProvider>
        <CartProvider>

          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Routes>
                {routes.map(({ path, element }, index) => (
                  <Route key={index} path={path} element={element} />
                ))}
              </Routes>
            </main>
          </div>
        </CartProvider>
      </SessionProvider>
    </Router>
  );
}

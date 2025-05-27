// /src/routes/routes.jsx
import Home from "../pages/Home";
import About from "../pages/About";
// import CategoryPage from "../pages/category/CategoryPage";
// import CategoryGrid from "../pages/CategoryGrid";
// import Services from "../pages/Services";
// import Login from "../pages/auth/Login";
// import Signup from "../pages/auth/Signup";
// import Contact from "../pages/Contact";
import ItemDetail from "../pages/ItemsDetails";
import ProductCard from "../components/ProductCard";
import ProductList from "../components/ProductList";
import HomePageAnimation from "../pages/HomePageAnimation";
import BrandSlider from "../components/BrandSlider";
import CartDrawer from "../components/CartDrawer";
import Services from "../pages/Services";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OtpVerify from "../pages/OtpVerify";
import DashboardHome from "../pages/Dashboard";
import DashboardLayout from "../layout/DashboardLayout";
import MainLayout from "../layout/MainLayout";

const routes = [
  {
    path: "/",
    element: (
      <MainLayout>
        <Home />{" "}
      </MainLayout>
    ),
  },
  { path: "/about", element: <About /> },
  // { path: "/category/:categoryName", element: <CategoryPage /> },
  // { path: "/categories", element: <CategoryGrid /> },
  { path: "/products", element: <ProductList /> },
  { path: "/homePageAnimation", element: <HomePageAnimation /> },
  { path: "/brandSlider", element: <BrandSlider /> },
  { path: "/services", element: <Services /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/otp/:email", element: <OtpVerify /> },
  // { path: "/contact", element: <Contact /> },
  { path: "/item/:id", element: <ItemDetail /> },
  { path: "/product", element: <ProductCard /> },
  { path: "/cartdrawer", element: <CartDrawer /> },
  {
    path: "/dashboard",
    element: (
      <DashboardLayout>
        <DashboardHome />
      </DashboardLayout>
    ),
  },
];

export default routes;

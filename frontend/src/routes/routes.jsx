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
import OrdersPage from "../pages/Dashboard/Orders";
import ProductsPage from "../pages/Dashboard/Products";
import ProfilePage from "../pages/Dashboard/Profile";
import Create from "../pages/Dashboard/Products/Create";
import EditProduct from "../pages/Dashboard/Products/EditProduct";
import VendorsPage from "../pages/Dashboard/SalesRep/VendorsPage";
import FranchisePage from "../pages/Dashboard/SalesRep/FranchisePage";
import MembershipPage from "../pages/Dashboard/Users/MembershipPage";
import ReferralsPage from "../pages/Dashboard/Users/ReferralsPage";
import LevelIncomePage from "../pages/Dashboard/Users/LevelIncomePage";
import WalletHistoryPage from "../pages/Dashboard/Users/WalletHistoryPage";
import ManageWalletPage from "../pages/Dashboard/Users/ManageWalletPage";
import UsersPage from "../pages/Dashboard/Franchise/UsersPage";
import FranchiseVendorsPage from "../pages/Dashboard/Franchise/FranchiseVendorsPage";
import RewardsPage from "../pages/Dashboard/Rewards";

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
  {
    path: "/dashboard/orders",
    element: (
      <DashboardLayout>
        <OrdersPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/products",
    element: (
      <DashboardLayout>
        <ProductsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/products/create",
    element: (
      <DashboardLayout>
        <Create />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/products/edit/:id",
    element: (
      <DashboardLayout>
        <EditProduct />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/profile",
    element: (
      <DashboardLayout>
        <ProfilePage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/sales-rep/vendors",
    element: (
      <DashboardLayout>
        <VendorsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/sales-rep/franchises",
    element: (
      <DashboardLayout>
        <FranchisePage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/membership",
    element: (
      <DashboardLayout>
        <MembershipPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/referrals",
    element: (
      <DashboardLayout>
        <ReferralsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/income/level",
    element: (
      <DashboardLayout>
        <LevelIncomePage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/income/rewards",
    element: (
      <DashboardLayout>
        <RewardsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/wallet/history",
    element: (
      <DashboardLayout>
        <WalletHistoryPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/wallet/manage",
    element: (
      <DashboardLayout>
        <ManageWalletPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/vendors",
    element: (
      <DashboardLayout>
        <FranchiseVendorsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/users",
    element: (
      <DashboardLayout>
        <UsersPage />
      </DashboardLayout>
    ),
  },
];

export default routes;

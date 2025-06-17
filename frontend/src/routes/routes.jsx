import Home from "../pages/Home";
import About from "../pages/About";
import ItemDetail from "../pages/ProductDetailPage";
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
import AdminVendorsPage from "../pages/Dashboard/Admin/AdminVendorsPage";
import AdminFranchisePage from "../pages/Dashboard/Admin/AdminFranchisePage";
import BannersPage from "../pages/Dashboard/Admin/BannersPage";
import TransactionsPage from "../pages/Dashboard/Admin/TransactionsPage";
import AdminUsersPage from "../pages/Dashboard/Admin/AdminUsersPage";
import CashbackMilestonesPage from "../pages/Dashboard/Admin/CashbackMilestonesPage";
import FranchiseMilestonesPage from "../pages/Dashboard/Admin/FranchiseMilestonesPage";
import MembershipMilestonesPage from "../pages/Dashboard/Admin/MembershipMilestonesPage";
import MembershipReportsPage from "../pages/Dashboard/Admin/MembershipReportsPage";
import RewardsDistributionPage from "../pages/Dashboard/Admin/RewardsDistributionPage";
import SalesReportsPage from "../pages/Dashboard/Admin/SalesReportsPage";
import CheckoutSuccessPage from "../components/Checkout/Success";
import CheckoutPage from "../components/Checkout/CheckoutPage";
import BrowsePage from "../components/Products/Browse";
import ProductDetailPage from "../pages/ProductDetailPage";
import { Toaster } from "sonner";
import UsersDetailsPageAdmin from "../pages/Dashboard/Admin/UsersDetailsPageAdmin";
import EmiSchedule from "../pages/Dashboard/Users/EmiSchedule";
import Test from "../pages/Dashboard/test";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CompanyPolicy from "../pages/CompanyPolicy";
import BusinessPlan from "../pages/BusinessPlan";
import EmiPlan from "../pages/EmiPlan";
import PackagesPage from "../pages/Dashboard/Admin/PackagesPage";
import SalesRepsPage from "../pages/Dashboard/Admin/SalesRepPage";
import CouponManager from "../pages/Dashboard/Admin/Coupon";
import VendorDetailsPage from "../components/Dashboad/Admin/vendorDetailsPage";
import TicketListPage from "../pages/Dashboard/Ticket/TicketListPage";
import MessagingPage from "../pages/Dashboard/Ticket/MessagingPage";
import CategoryManagementPage from "../pages/Dashboard/Admin/CategoryManagementPage";
import AcceptTermsAndConditionsPage from "../pages/AcceptTerm_condition";

const routes = [
  {
    path: "/",
    element: (
      <MainLayout>
        <Home />{" "}
      </MainLayout>
    ),
  },
  {
    path: "/checkout/success",
    element: (
      <MainLayout>
        <CheckoutSuccessPage />
      </MainLayout>
    ),
  },

  // {
  //   path: "/cashbackcard",
  //   element: (
  //     <MainLayout>
  //       <CashbackCard />
  //     </MainLayout>
  //   ),
  // },
  {
    path: "/checkout",
    element: (
      <MainLayout>
        <CheckoutPage />
      </MainLayout>
    ),
  },
  {
    path: "/browse",
    element: (
      <MainLayout>
        <BrowsePage />
      </MainLayout>
    ),
  },

  {
    path: "/about",
    element: (
      <MainLayout>
        <About />
      </MainLayout>
    ),
  },
  {
    path: "/products",
    element: (
      <MainLayout>
        <ProductList />
      </MainLayout>
    ),
  },
  {
    path: "/homePageAnimation",
    element: (
      <MainLayout>
        <HomePageAnimation />
      </MainLayout>
    ),
  },
  {
    path: "/brandSlider",
    element: (
      <MainLayout>
        <BrandSlider />
      </MainLayout>
    ),
  },
  {
    path: "/services",
    element: (
      <MainLayout>
        <Services />
      </MainLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <MainLayout>
        <Login />
      </MainLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <MainLayout>
        <Signup />
      </MainLayout>
    ),
  },
  {
    path: "/otp/:email",
    element: (
      <MainLayout>
        <OtpVerify />
      </MainLayout>
    ),
  },
  {
    path: "/item/:productId",
    element: (
      <MainLayout>
        <ProductDetailPage />
      </MainLayout>
    ),
  },
  {
    path: "/product",
    element: (
      <MainLayout>
        <ProductCard />
      </MainLayout>
    ),
  },

  {
    path: "/tnc",
    element: (
      <MainLayout>
        <TermsAndConditions />
      </MainLayout>
    ),
  },
  {
    path: "/accept-tnc",
    element: (
      <MainLayout>
        < AcceptTermsAndConditionsPage/>
      </MainLayout>
    ),
  },
  {
    path: "/privacy-policy",
    element: (
      <MainLayout>
        <PrivacyPolicy />
      </MainLayout>
    ),
  },
  {
    path: "/company-policy",
    element: (
      <MainLayout>
        <CompanyPolicy />
      </MainLayout>
    ),
  },
  {
    path: "/buisness-plan",
    element: (
      <MainLayout>
        <BusinessPlan />
      </MainLayout>
    ),
  },
  {
    path: "/emi-plan",
    element: (
      <MainLayout>
        <EmiPlan />
      </MainLayout>
    ),
  },

  {
    path: "/cartdrawer",
    element: (
      <MainLayout>
        <CartDrawer />
      </MainLayout>
    ),
  },
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

  {
    path: "/dashboard/admin/vendors",
    element: (
      <DashboardLayout>
        <AdminVendorsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/vendors/:vendorId",
    element: (
      <DashboardLayout>
        <VendorDetailsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/vendors/franchises",
    element: (
      <DashboardLayout>
        <AdminFranchisePage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/salesrep",
    element: (
      <DashboardLayout>
        <SalesRepsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/coupon",
    element: (
      <DashboardLayout>
        <CouponManager />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/reports/sales",
    element: (
      <DashboardLayout>
        <SalesReportsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/reports/membership",
    element: (
      <DashboardLayout>
        <MembershipReportsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/reports/rewards",
    element: (
      <DashboardLayout>
        <RewardsDistributionPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/manage/membership-milestones",
    element: (
      <DashboardLayout>
        <MembershipMilestonesPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/manage/cashbacks-milestones",
    element: (
      <DashboardLayout>
        <CashbackMilestonesPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/manage/franchise-milestones",
    element: (
      <DashboardLayout>
        <FranchiseMilestonesPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/users",
    element: (
      <DashboardLayout>
        <AdminUsersPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/users/:id",
    element: (
      <DashboardLayout>
        <UsersDetailsPageAdmin />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/transactions",
    element: (
      <DashboardLayout>
        <TransactionsPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/packages",
    element: (
      <DashboardLayout>
        <PackagesPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/admin/banners",
    element: (
      <DashboardLayout>
        <BannersPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/category",
    element: (
      <DashboardLayout>
        <CategoryManagementPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/emi-schedule",
    element: (
      <DashboardLayout>
        <EmiSchedule />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/test",
    element: (
      <DashboardLayout>
        <Test />
      </DashboardLayout>
    ),
  },

  {
    path: "/dashboard/tickets",
    element: (
      <DashboardLayout>
        <TicketListPage />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/tickets/:ticketId",
    element: (
      <DashboardLayout>
        <MessagingPage />
      </DashboardLayout>
    ),
  },
  {
    path: "*",
    element: <h1>404 - Page Not Found</h1>,
  },
];

export default routes;

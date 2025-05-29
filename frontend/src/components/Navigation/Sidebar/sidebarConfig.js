import {
  Home,
  Users,
  Package,
  TrendingUp,
  History,
  Layers,
  Gift,
  UserPlus,
  FileText,
  Wallet,
  Banknote,
  Settings,
  ArrowRightLeft,
  BarChart3,
  DollarSign,
  ListChecks,
  Coins,
  Building2,
  ShoppingCart,
  LayoutGrid,
  Tag,
  ShieldCheck,
  Milestone,
} from "lucide-react";

export const sidebarConfig = {
  shared: [{ label: "Home", icon: Home, href: "/dashboard" }],

  user: [
    {
      label: "Network",
      icon: Users,
      items: [
        {
          label: "My Membership",
          icon: ShieldCheck,
          href: "/dashboard/membership",
        },
        {
          label: "Referrals",
          icon: UserPlus,
          href: "/dashboard/referrals",
        },
      ],
    },

    {
      label: "Income",
      icon: BarChart3,
      items: [
        {
          label: "Level Income",
          href: "/dashboard/income/level",
          icon: Layers,
        },
        {
          label: "Rewards",
          href: "/dashboard/income/rewards",
          icon: Gift,
        },
      ],
    },

    {
      label: "Wallet",
      icon: Wallet,
      items: [
        {
          label: "History",
          href: "/dashboard/wallet/history",
          icon: History,
        },
        {
          label: "Manage",
          href: "/dashboard/wallet/manage",
          icon: Settings,
        },
      ],
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/dashboard/orders",
    },
    {
      label: "Profile Settings",
      icon: Settings,
      href: "/dashboard/profile",
    },
  ],

  vendor: [
    {
      label: "Products",
      icon: Package,
      href: "/dashboard/products",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/dashboard/orders",
    },

    // {
    //   label: "Profile Settings",
    //   icon: Settings,
    //   href: "/dashboard/profile",
    // },
  ],

  "sales-rep": [
    {
      label: "Vendors",
      icon: Package,
      href: "/dashboard/sales-rep/vendors",
    },
    {
      label: "Franchises",
      icon: Building2,
      href: "/dashboard/sales-rep/franchises",
    },
  ],
  "franchise-admin": [
    // {
    //   label: "Vendors",
    //   icon: Package,
    //   href: "/dashboard/vendors",
    // },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/users",
    },
    {
      label: "Rewards",
      icon: Milestone,
      href: "/dashboard/income/rewards",
    },
    {
      label: "Wallet",
      icon: Wallet,
      items: [
        {
          label: "History",
          href: "/dashboard/wallet/history",
          icon: History,
        },
        {
          label: "Manage",
          href: "/dashboard/wallet/manage",
          icon: Settings,
        },
      ],
    },
  ],
  admin: [
    {
      label: "Distribution",
      icon: Package,
      items: [
        {
          label: "Vendors",
          href: "/dashboard/admin/vendors",
          icon: Package,
        },
        {
          label: "Franchises",
          href: "/dashboard/admin/vendors/franchises",
          icon: UserPlus,
        },
      ],
    },

    {
      label: "Reports",
      icon: DollarSign,
      items: [
        {
          label: "Sales",
          href: "/dashboard/admin/reports/sales",
          icon: FileText,
        },
        {
          label: "Membership",
          href: "/dashboard/admin/reports/membership",
          icon: Layers,
        },
        {
          label: "Reward Distribution",
          href: "/dashboard/admin/reports/rewards",
          icon: UserPlus,
        },
      ],
    },
    {
      label: "Rewards",
      icon: Milestone,
      items: [
        {
          label: "Membership",
          href: "/dashboard/admin/manage/membership-milestones",
          icon: FileText,
        },
        {
          label: "Cashbacks",
          href: "/dashboard/admin/manage/cashbacks-milestones",
          icon: Layers,
        },
        {
          label: "Franchise",
          href: "/dashboard/admin/manage/franchise-milestones",
          icon: UserPlus,
        },
      ],
    },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      label: "Transactions",
      icon: Banknote,
      href: "/dashboard/admin/transactions",
    },
    {
      label: "Banners",
      icon: Tag,
      href: "/dashboard/admin/banners",
    },
  ],
};

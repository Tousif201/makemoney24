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
} from "lucide-react";

export const sidebarConfig = {
  shared: [{ label: "Home", icon: Home, href: "/dashboard" }],
  user: [
    {
      label: "Packages",
      icon: Package,
      items: [
        { label: "All", href: "/dashboard/packages", icon: ListChecks },
        {
          label: "Place Trade",
          href: "/dashboard/packages/place-trade",
          icon: TrendingUp,
        },
        {
          label: "History",
          href: "/dashboard/packages/history",
          icon: History,
        },
      ],
    },
    {
      label: "Income Report",
      icon: BarChart3,
      items: [
        // {
        //   label: "Referral Income",
        //   href: "/dashboard/income/referral",
        //   icon: UserPlus,
        // },
        {
          label: "Level Income",
          href: "/dashboard/income/level",
          icon: Layers,
        },
        {
          label: "Milestone Rewards",
          href: "/dashboard/income/rewards",
          icon: Gift,
        },
      ],
    },
    {
      label: "Wallet",
      icon: Wallet,
      items: [
        { label: "History", href: "/dashboard/wallet/history", icon: History },
        { label: "Manage", href: "/dashboard/wallet/manage", icon: Settings },
      ],
    },
    // {
    //   label: "Your Team",
    //   icon: Users,
    //   items: [
    //     { label: "Direct", href: "/dashboard/team/direct", icon: UserPlus },
    //     { label: "Levels", href: "/dashboard/team/levels", icon: Coins },
    //   ],
    // },
  ],
  admin: [
    {
      label: "Users",
      icon: Users,
      items: [{ label: "All Users", href: "/dashboard/users", icon: Users }],
    },
    {
      label: "Reports",
      icon: DollarSign,
      items: [
        {
          label: "Package History",
          href: "/dashboard/finance/package-history",
          icon: FileText,
        },
        {
          label: "Level Income",
          href: "/dashboard/income/level",
          icon: Layers,
        },
        // {
        //   label: "Referral Income History",
        //   href: "/dashboard/finance/referral-income",
        //   icon: UserPlus,
        // },
        // {
        //   label: "Level Income History",
        //   href: "/dashboard/finance/level-income",
        //   icon: Layers,
        // },
      ],
    },
    // {
    //   label: "Packages",
    //   icon: Package,
    //   items: [
    //     {
    //       label: "Manage Packages",
    //       href: "/dashboard/packages/manage",
    //       icon: Settings,
    //     },
    //   ],
    // },
    // {
    //   label: "Wallet",
    //   icon: Wallet,
    //   items: [
    //     { label: "History", href: "/dashboard/wallet/history", icon: History },
    //     { label: "Manage", href: "/dashboard/wallet/manage", icon: Settings },
    //   ],
    // },
    {
      label: "Transactions",
      icon: Banknote,
      items: [
        {
          label: "Deposit",
          href: "/dashboard/transactions/deposit",
          icon: FileText,
        },
        {
          label: "Withdrawal",
          href: "/dashboard/transactions/withdrawal",
          icon: History,
        },
      ],
    },
  ],
};

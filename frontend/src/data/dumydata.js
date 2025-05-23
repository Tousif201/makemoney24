const menuItems = [
    {
      name: "Mens",
      subItems: [
        { name: "T-Shirts", path: "/mens/tshirts" },
        { name: "Jeans", path: "/mens/jeans" },
        { name: "Shoes", path: "/mens/shoes" },
        { name: "Jackets", path: "/mens/jackets" },
        { name: "Watches", path: "/mens/watches" },
        { name: "Sunglasses", path: "/mens/sunglasses" }
      ],
    },
    {
      name: "Womens",
      subItems: [
        { name: "All Women's Wear", path: "/categories/women" },  // ✅ Add this
        { name: "Dresses", path: "/womens/dresses" },
        { name: "Tops", path: "/womens/tops" },
        { name: "Handbags", path: "/womens/handbags" },
        { name: "Shoes", path: "/womens/shoes" },
        { name: "Makeup", path: "/womens/makeup" },
        { name: "Jewellery", path: "/womens/jewellery" }
      ],
    },
    {
      name: "Accessories",
      subItems: [
        { name: "Belts", path: "/accessories/belts" },
        { name: "Caps", path: "/accessories/caps" },
        { name: "Bags", path: "/accessories/bags" },
        { name: "Socks", path: "/accessories/socks" },
        { name: "Scarves", path: "/accessories/scarves" },
        { name: "Wallets", path: "/accessories/wallets" }
      ],
    },
  ];
  
  export default menuItems;
  
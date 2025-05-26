const categories = [
    { title: "Women Kurti", image: "https://assets.myntassets.com/dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/29870795/2024/6/10/8763ba69-0cfa-4e84-a357-0d65b13bd2ef1718012866458-Tasarika-Floral-Printed-A-line-Maxi-Gown-Ethnic-Dresses-6541-1.jpg" },
    { title: "Women Saree", image: "https://images.cbazaar.com/images/blue-georgette-embroidered-sequins-chic-saree-for-classic-indian-women-sasacy6989-u.jpg" },
    { title: "Women Shirt", image: "https://rukminim2.flixcart.com/image/550/650/xif0q/shirt/o/3/g/l-4898-901-funday-fashion-original-imagntyasjyghwha.jpeg?q=90&crop=false" },
    { title: "Women T- Shirt", image: "https://assets.ajio.com/medias/sys_master/root/20231030/7ddV/653f8587ddf77915196281e4/-473Wx593H-466758117-green-MODEL.jpg" },
    { title: "Women Suit", image: "https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/26830434/2024/5/28/faca4b77-3452-44a0-a10e-238f1e9090901716898070347-her-by-invictus-Women-Co-Ords-7531716898069844-6.jpg" },
    { title: "Women Tunic", image: "https://assets.ajio.com/medias/sys_master/root/20250305/s2Cc/67c8062e2960820c49cfe4f7/-473Wx593H-464441068-blue-MODEL.jpg" },
    { title: "Women Blazer", image: "https://rukminim2.flixcart.com/image/550/650/xif0q/blazer/h/c/v/s-1-kid-for-blaz-lb-rocksy-original-imah54vyrxjgdhxb.jpeg?q=90&crop=false" },
    { title: "Co-ord Set", image: "https://ambraee.com/cdn/shop/products/OM_6852_01932def-cd7a-417f-988a-5a4c6b982336.jpg?v=1691223686&width=1080" },
  ];
  
  const CategoryGrid = () => {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Explore Women's Fashion</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.slice(0, 2).map((cat, idx) => (
              <div
                key={idx}
                className="relative md:h-full h-52 rounded overflow-hidden shadow-lg"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.6), transparent), url(${cat.image}) center/cover no-repeat`,
                }}
              >
                <div className="absolute bottom-0 w-full text-center text-white text-sm font-medium p-4 bg-gradient-to-t from-black/80 via-transparent">
                  {cat.title}
                </div>
              </div>
            ))}
          </div>
  
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.slice(2).map((cat, idx) => (
              <div
                key={idx}
                className="relative h-[250px] rounded overflow-hidden shadow"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.6), transparent), url(${cat.image}) center/cover no-repeat`,
                }}
              >
                <div className="absolute bottom-0 w-full text-center text-white text-sm font-medium p-2 bg-gradient-to-t from-black/80 via-transparent">
                  {cat.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default CategoryGrid;
  
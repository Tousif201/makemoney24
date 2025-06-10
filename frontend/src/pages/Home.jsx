import Banner from "../components/Banner";
import BrandSlider from "../components/BrandSlider";
import CategoryCard from "../components/CategoryCard";
import LandingSlider from "../components/LandingSlider";
import ProductList from "../components/ProductList";
import UserScrollSlider from "../components/UserScrollSlider";
import UserScrollslider from "../components/UserScrollSlider";
import HomePageAnimation from "./HomePageAnimation";
import Services from "./Services";

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <LandingSlider />
      <UserScrollSlider />
      <div className="block md:hidden w-full overflow-x-auto whitespace-nowrap px-2 py-3 bg-white shadow-sm">
        <div className="flex gap-3 min-w-max">
          <button
            onClick={() => handleFilter("All Items")}
            className="px-4 py-2 border rounded-full text-sm font-medium"
          >
            All Items⌄
          </button>

          <button
            onClick={() => handleFilter("Products")}
            className="px-4 py-2 border rounded-full text-sm font-medium"
          >
            Products ⌄
          </button>

          <button
            onClick={() => handleFilter("Services")}
            className="px-4 py-2 border rounded-full text-sm font-medium"
          >
            ☰ Services
          </button>
        </div>
      </div>
      <ProductList />

      <HomePageAnimation />

      {/* <BrandSlider /> */}
    </div>
  );
}

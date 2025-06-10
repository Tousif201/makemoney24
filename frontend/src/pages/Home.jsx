import Banner from "../components/Banner";
import BrandSlider from "../components/BrandSlider";
import CategoryCard from "../components/CategoryCard";
import LandingSlider from "../components/LandingSlider";
import ProductList from "../components/ProductList";
import UserScrollSlider from "../components/UserScrollSlider";
import UserScrollslider from "../components/UserScrollSlider";
import HomePageAnimation from "./HomePageAnimation";

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <LandingSlider />
      <UserScrollSlider />
      
      <ProductList />

      <HomePageAnimation />

      {/* <BrandSlider /> */}
    </div>
  );
}

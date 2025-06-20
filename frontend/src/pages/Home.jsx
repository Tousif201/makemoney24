
import CategoryScrollSlider from "../components/CategoryScrollSlider";
import LandingSlider from "../components/LandingSlider";
import ProductList from "../components/ProductList";
import ServiesList from "../components/ServiesList";
import HomePageAnimation from "./HomePageAnimation";

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <LandingSlider />
      <CategoryScrollSlider type={"product"} />
      <ProductList />
      <HomePageAnimation />
      <CategoryScrollSlider type={"service"} />
      <ServiesList />

      {/* <BrandSlider /> */}
    </div>
  );
}

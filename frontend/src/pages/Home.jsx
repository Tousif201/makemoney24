import CategoryScrollSlider from "../components/CategoryScrollSlider";
import LandingSlider from "../components/LandingSlider";
import ProductList from "../components/Products/ProductList";
import ServiesList from "../components/ServiesList";
// import HomePageAnimation from "./HomePageAnimation";

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <LandingSlider displayRange="firstHalf" />
      <CategoryScrollSlider type={"product"} />
      <ProductList />
      <LandingSlider displayRange="secondHalf" />

      {/* <HomePageAnimation /> */}
      <CategoryScrollSlider type={"service"} />
      <ServiesList />

      {/* <BrandSlider /> */}
    </div>
  );
}

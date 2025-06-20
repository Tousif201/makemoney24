
import LandingSlider from "../components/LandingSlider";
import ServiesList from "../components/ServiesList";
import HomePageAnimation from "./HomePageAnimation";
import ProductCategoryScrollSlider from "../components/CategoryScrollSlider";

const Services = () => {
  return (
    <>
      <LandingSlider />
      <ProductCategoryScrollSlider />
      <ServiesList />
      <HomePageAnimation />
    </>
  );
};

export default Services;

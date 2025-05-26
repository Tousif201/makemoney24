import Banner from '../components/Banner';
import BrandSlider from '../components/BrandSlider';
import CartDrawer from '../components/CartDrawer';
import CategoryCard from '../components/CategoryCard';
import LandingSlider from '../components/LandingSlider';
import ProductList from '../components/ProductList';
import UserScrollSlider from '../components/UserScrollSlider';
import UserScrollslider from '../components/UserScrollSlider';
import HomePageAnimation from './HomePageAnimation';
import Services from './Services';

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <LandingSlider />
      <UserScrollSlider/>
        <ProductList />
        <HomePageAnimation/>
        
         <BrandSlider/>
         <CartDrawer/>
         
         
      {/* Optional: Add categories below */}
      {/* <section>
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <CategoryCard title="Products" />
          <CategoryCard title="Services" />
        </div>
      </section> */}
    </div>
  );
}

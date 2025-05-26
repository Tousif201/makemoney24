import React from 'react';
import brand2 from "../assets/brandslider/3.png";
import brand1 from "../assets/brandslider/4.png";
import brand3 from "../assets/brandslider/5.png";
import brand4 from "../assets/brandslider/6.png";
import brand5 from "../assets/brandslider/3.png";
import brand6 from "../assets/brandslider/4.png";
import brand7 from "../assets/brandslider/5.png";
import brand8 from "../assets/brandslider/6.png";

const BrandSlider = () => {
  const data = [brand1, brand2, brand3, brand4, brand5, brand6, brand7, brand8];

  return (
    <div className="overflow-hidden w-full py-4 ">
      {/* <h2 className="text-2xl font-semibold mb-6 text-center"><span className="text-bg-color">Brands</span></h2> */}
      <div className="flex animate-scroll w-max">
        {[...data, ...data].map((el, idx) => (
          <div
            key={idx}
            className="bg-white w-52  border rounded-lg flex items-center justify-center mx-2 shrink-0"
          >
            <img src={el} alt={`brand-${idx}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandSlider;

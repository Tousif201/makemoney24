import React from 'react';
import brand1 from "../assets/slider/userscroll1.jpg";
import brand2 from "../assets/slider/bag.jpg";
import brand3 from "../assets/slider/cap.jpg";
import brand4 from "../assets/slider/jeans.jpg";
import brand5 from "../assets/slider/3.png";
import brand6 from "../assets/slider/watch.jpg";
import brand7 from "../assets/slider/Tshirt.jpg";
import brand8 from "../assets/slider/sandle.jpg";
import brand9 from "../assets/slider/watch2.jpg";

// Array with both image and name
const data = [
  { img: brand1, name: "User Scroll" },
  { img: brand2, name: "Bag" },
  { img: brand3, name: "Cap" },
  { img: brand9, name: "watch" },
  { img: brand4, name: "Jeans" },
  { img: brand5, name: "Style 3" },
  { img: brand6, name: "Watch" },
  { img: brand7, name: "T-Shirt" },
  { img: brand8, name: "Sandle" },
  { img: brand3, name: "stylish Cap" },
  { img: brand1, name: "Watch 2" },
];

const UserScrollSlider = () => {
  return (
    <div className="overflow-hidden w-full py-4">
      <div className="flex animate-scroll w-max">
        {[...data, ...data].map((item, idx) => (
          <div
            key={idx}
            className="w-32 h-40 flex flex-col items-center justify-start mx-2 shrink-0"
          >
            <img
              src={item.img}
              alt={`brand-${idx}`}
              className="w-28 h-28 object-cover rounded-full"
            />
            <p className="text-center text-sm mt-2">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserScrollSlider;

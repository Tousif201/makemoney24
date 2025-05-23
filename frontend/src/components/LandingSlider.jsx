import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";

import Slider1 from "../assets/landingslider/4.jpg";
import Slider2 from "../assets/landingslider/5.jpg";
import Slider3 from "../assets/landingslider/6.jpg";

const LandingSlider = () => {
  const swiperImages = [Slider1, Slider2, Slider3];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-auto overflow-hidden rounded-lg">
        <Swiper
          slidesPerView="auto"
          spaceBetween={30}
          loop={true}
          speed={5000}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          className="w-full lg:h-auto sm:h-[70vh] h-[50vh]"
        >
          {swiperImages.map((image, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <img
                src={image}
                className="h-full w-full object-cover"
                alt={`Slide ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default LandingSlider;

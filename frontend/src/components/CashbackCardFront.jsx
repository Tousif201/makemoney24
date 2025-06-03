import React from "react";
import { Card } from "@/components/ui/card";
import frontImg from "../assets/cashback/card11.png";
import logo from "../assets/makemoney.png";

const CashbackCardFront = ({
  userName = "Priyanshu Sahu",
  cardNumber = "0987 6543 2109 1234",
  validFrom = "05/25",
  expiryDate = "05/26",
}) => {
  return (
    <Card className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold mx-auto">
      <img
        src={frontImg}
        alt="Card Front Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-3 xs:p-4 sm:p-6 md:p-7 lg:p-8">
        {/* Logo Section */}
        <div>
          <img 
            src={logo} 
            alt="Logo" 
            className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16" 
          />
        </div>
        
        {/* Main Card Content */}
        <div>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4">
            CASHBACK CARD
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl tracking-widest mb-3 xs:mb-4 sm:mb-5 md:mb-6 font-mono">
            {cardNumber}
          </p>
          <p className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-lg">
            {userName}
          </p>
        </div>
        
        {/* Date Information */}
        <div className="flex gap-4 xs:gap-5 sm:gap-6 text-xs xs:text-xs sm:text-sm md:text-sm">
          <div>
            <p className="text-gray-200 mb-1">VALID FROM</p>
            <p className="font-semibold">{validFrom}</p>
          </div>
          <div>
            <p className="text-gray-200 mb-1">EXPIRY DATE</p>
            <p className="font-semibold">{expiryDate}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CashbackCardFront;
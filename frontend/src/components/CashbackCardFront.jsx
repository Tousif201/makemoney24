import React from "react";
import { Card } from "@/components/ui/card";
import frontImg from "../assets/cashback/card11.png";
import logo from "../assets/whitemakemoney.png";

const CashbackCardFront = ({
  userName ,date,cardNumber,validDate,expiredDate
  
}) => {
 
  const createdDate = new Date(validDate);

  // Format validFrom as MM/YY
  const validFrom = createdDate.toLocaleDateString("en-US", {
    month: "2-digit",
    year: "2-digit",
  });

  // Add 1 year for expiry
  const expiryDateObj =new Date(expiredDate);

  const expiryDate = expiryDateObj.toLocaleDateString("en-US", {
    month: "2-digit",
    year: "2-digit",
  });
  return (
    <Card className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold mx-auto">
      <img
        src={frontImg}
        alt="Card Front Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-3 xs:p-4 sm:p-6 md:p-7 lg:p-4">
        {/* Logo Section */}
        <div>
          <img 
            src={logo} 
            alt="Logo" 
            className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 relative bottom-4" 
          />
        </div>
        
        {/* Main Card Content */}
        <div>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4">
            CASHBACK CARD
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl tracking-widest mb-0 xs:mb-4 sm:mb-3 md:mb-2 font-mono">
            {cardNumber}
          </p>
          <p className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-lg ">
            {userName}
          </p>
        </div>
        
        {/* Date Information */}
        <div className="flex gap-2 xs:gap-5 sm:gap-6 text-[7px] xs:text-[7px] sm:text-[10px] md:text-xs mt-2 ">
          <div className="flex gap-2">
            <p className="text-gray-200  mb-1">VALID <p>FROM</p></p>
            <p className="font-semibold text-[15px]">{validFrom}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-gray-200 mb-1">EXPIRY <p>DATE</p></p>
            <p className="font-semibold text-[15px]">{expiryDate}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CashbackCardFront;
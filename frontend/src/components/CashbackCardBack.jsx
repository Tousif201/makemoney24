import React from "react";
import { Card } from "@/components/ui/card";
import backImg from "../assets/cashback/cardback.png";
import logo from "../assets/whitemakemoney.png";

const CashbackCardBack = ({
  email = "info@makemoney24hrs.com",
  notes = [
    "This card is only valid for people who are registered as members",
    "This membership card can be used in all regions",
  ],
}) => {
  return (
    <Card className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold mx-auto">
      <img
        src={backImg}
        alt="Card Back Background"
        className="absolute inset-0 w-full h-full object-cover z-0 "
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-3 xs:p-4 sm:p-6 md:p-7 lg:p-8">
        {/* Header Section */}
        <div>
          <img 
            src={logo} 
            alt="Logo" 
            className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 mb-2 xs:mb-3 sm:mb-4" 
          />
          <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-2xl font-bold">
            PRODUCT EMI CARD
          </h2>
        </div>

        {/* Contact Information */}
        <div className="text-xs xs:text-sm sm:text-base md:text-base space-y-1 xs:space-y-2">
          {/* <p className="flex items-center gap-2">
            <span className="text-sm xs:text-base">📞</span> 
            <span className="break-all">{phone}</span>
          </p> */}
          <p className="flex items-center ">
            <span className="text-[10px] md:text-sm xs:text-base">📧</span> 
            <span className="break-all text-[10px] md:text-sm">{email}</span>
          </p>
        </div>

        {/* Notes Section */}
        <div className="text-[8px] mt-2 xs:text-xs sm:text-[5px] md:text-sm  xs:mt-3 sm:mt-4 space-y-1 xs:space-y-2 text-gray-100 ">
          {notes.map((note, index) => (
            <p key={index} className="leading-tight ">
              <span className="font-semibold">{index + 1}.</span> {note}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CashbackCardBack;
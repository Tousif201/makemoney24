import React from "react";
import { Card } from "@/components/ui/card";
import frontImg from "../assets/cashback/card11.png";
import backImg from "../assets/cashback/card12.png";
import logo from "../assets/makemoney.png";

const CashbackCard = ({
  userName = "Priyanshu Sahu",
  cardNumber = "0987 6543 2109 1234",
  validFrom = "05/25",
  expiryDate = "05/26",
  phone = "+123-456-7890",
  email = "hello@reallygreatsite.com",
  notes = [
    "This card is only valid for people who are registered as members",
    "This membership card can be used in all regions",
  ],
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 bg-gray-100 p-4 sm:p-6">
      
      {/* Front of the Card */}
      <Card className="relative max-w-[500px] w-full aspect-[10/7] sm:aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold">
        <img
          src={frontImg}
          alt="Card Front Background"
          className="absolute inset-0 w-full h-full object-cover z-0 "
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 bottom-3">
          <div>
            <img src={logo} alt="Logo" className="h-12 w-12 sm:h-16 sm:w-16 relative bottom-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">CASHBACK CARD</h2>
            <p className="text-lg sm:text-2xl tracking-widest mb-4 sm:mb-6">{cardNumber}</p>
            <p className="text-base sm:text-lg">{userName}</p>
          </div>
          <div className="flex gap-6 text-xs sm:text-sm">
            <div>
              <p className="text-gray-200">VALID FROM</p>
              <p>{validFrom}</p>
            </div>
            <div>
              <p className="text-gray-200">EXPIRY DATE</p>
              <p>{expiryDate}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Back of the Card */}
      <Card className="relative max-w-[500px] w-full aspect-[10/7] sm:aspect-[10/7] rounded-2xl overflow-hidden shadow-xl bg-amber-600 text-white font-semibold">
        <img
          src={backImg}
          alt="Card Back Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 bottom-2">
          <div>
            <img src={logo} alt="Logo" className="h-12 sm:h-15 mb-3 sm:mb-4 " />
            <h2 className="text-xl sm:text-2xl font-bold">PRODUCT EMI CARD</h2>
          </div>

          <div className="text-sm sm:text-base">
            <p className="flex items-center gap-2">📞 {phone}</p>
            <p className="flex items-center gap-2">📧 {email}</p>
          </div>

          <div className="text-xs sm:text-sm mt-2 sm:mt-4 space-y-1 text-gray-100">
            {notes.map((note, index) => (
              <p key={index}>{index + 1}. {note}</p>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CashbackCard;

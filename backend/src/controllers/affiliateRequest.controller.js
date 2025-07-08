import { User } from "../models/User.model";
import { Affiliate } from "../models/Affiliate.model";
import { Address } from "../models/Address.model";

export const affiliateRequest = async (req,res)=>{
    try {
        const { companyName, address,city,state,pincode,isDefault} = req.body;

        // Validate required fields
        if (!companyName || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the user is already an affiliate
        const existingAffiliate = await Affiliate.findOne({ userId: req.user._id });
        if (existingAffiliate) {
            return res.status(400).json({ message: "You are already an affiliate." });
        }

     const newAddress = new Address({
      addressLine1,
      city,
      state,
      pincode,
      isDefault:isDefault||false,
      country: "India",
      owner: req.user._id,
    });

    await newAddress.save();

        // Create new affiliate request
        const newAffiliate = new Affiliate({
            userId: req.user._id,
            companyName,
            });

        await newAffiliate.save();

        // Update user's isAffiliate status
        await User.findByIdAndUpdate(req.user._id, { isAffiliate: "pending" });

        res.status(201).json({ message: "Affiliate request submitted successfully." });
    } catch (error) {
        console.error("Error in affiliateRequest:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}
export const getAffiliateRequests = async (req,res)=>{
    try{
        const affiliateRequestUser = await User.find({ isAffiliate: "pending"});
        if(!affiliateRequestUser || affiliateRequestUser.length === 0){
            return res.status(400).json({ message: "No affiliate requests found."});
        }
   const affiliateRequests = await Promise.all(affiliateRequestUser.map(async (user) => {
            const affiliate = await Affiliate.findOne({ userId: user._id });
            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                companyName: affiliate ? affiliate.companyName : null,
                address: await Address.findOne({ owner: user._id }),
            };
        }));

        res.status(200).json(affiliateRequests);

    }catch{
        console.error("Error in getAffiliateRequests:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}
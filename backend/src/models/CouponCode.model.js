import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
name:{type:String},
couponCode:{type:String,unique:true},
discountPercent :{type:Number,required:true},
expiryDate:{type : Date},
isActive:{type:String,enum :["active","inactive"],default:"active"}

});

export const Coupon = mongoose.model("Coupon",couponSchema)
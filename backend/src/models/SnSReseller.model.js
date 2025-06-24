import mongoose from "mongoose";

const snsResellerSchema = new mongoose.Schema({
userId :{type : mongoose.Schema.Types.ObjectId,ref:"User"},
TotalproductPurchased:{type:Number,default:0},
AmountSpent :{type:Number,default: 0},
TotalCommissionEarned :{ type : Number,default:0},
lastPurchasedAt :{type : Date},
totalBusiness : {type : Number,default:0},
},{timestamps:true});

export const SnSReseller = mongoose.model("snsReseller", snsResellerSchema);

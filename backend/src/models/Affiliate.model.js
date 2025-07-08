import mongoose from "mongoose";

const affiliateSchema = new mongoose.Schema({
    userId : { type : mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    companyName :{type:String,required:true,unique:true},
     salesRep:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    commisionRate:{type:Number,required:true,default:0},
    productBucket : [{type:mongoose.Schema.Types.ObjectId,ref:"ProductService"}],
    productReferralLink:{type:String,required:true,unique:true},
    totalProductSaled:{type:Number,default:0},
    totalCommissionEarned:{type:Number,default:0},

});

export const Affiliate = mongoose.model("Affiliate",affiliateSchema);
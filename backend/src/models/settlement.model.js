import mongoose from "mongoose";


const settlementSchema = new mongoose.Schema({
    byAdmin :{
        type :mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    toUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref :"User"
    },
    ammountSettle :{
        type:Number,
        required:true
    }},{timestamps:true
});

export const Settlement = mongoose.model("Settlement",settlementSchema)
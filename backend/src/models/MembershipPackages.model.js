import mongoose, { Schema, model } from "mongoose";

const membershipPackagesSchema = new Schema({
  name: {
     type: String,
 required: true,
  },
  
  validityInDays:{type: Number,required:false},
  description: { type: String }, 
  packageAmount: { type: Number, required: true },
  miscellaneousAmount: { type: Number, required: true }, },{
  timestamps: true // <--- ADD THIS LINE
});


export const MembershipPackages = model('membershipPackage', membershipPackagesSchema);

import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
    externalCompanyId: {
      type: String,
      required: true,
      unique: true
    },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  companyType: { type: String, required: true },
  gstNumber: { type: String, required: true },
  typeOfStaffing: { type: String, enum: ["contract", "permanent", "both"], required: true },
  panNumber: { type: String, required: true },
  phoneNo: { type: String, required: true },
  numberOfEmployees: { type: Number, required: true },
  address1: { type: String, required: true },
  address2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  logo: { type: String, default: "" },
  // Subscription fields
  subscription: {
    type: String,
    enum: ["trial", "pro", "premium"],
    default: "trial"
  },
  subscriptionStart: { type: Date, default: Date.now },
  subscriptionEnd: { type: Date },
  isTrialActive: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model("Company", CompanySchema);
import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      index: true, // for faster lookups if you want to query by IP
    },
    userAgent: {
      type: String,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;

// node models/seed/visitor.seed.js

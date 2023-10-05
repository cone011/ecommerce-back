const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    productCode: { type: String, require: true },
    title: { type: String, require: true },
    image: { type: String, require: true },
    price: { type: Number, require: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", productSchema);

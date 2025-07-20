const mongoose = require("mongoose");
const Review = require("./review");
const User = require("./user");
const { required } = require("joi");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("cardImage").get(function () {
  return this.url.replace("/upload", "/upload/ar_5:3,c_crop");
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
  {
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href = "/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 30)}...</p>`;
});

campgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);

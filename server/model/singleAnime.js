const Review = require("./review");

const mongoose = require("mongoose");
const { storage, cloudinary } = require("../cloudinary");

const AnimeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  animeName: String,
  rate: Number,
  producer: String,
  review: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

AnimeSchema.pre("deleteOne", { document: true }, async function (next) {
  console.log(this.image.filename);
  if (this.image.filename) {
    await cloudinary.uploader.destroy(this.image.filename);
  }
  await Review.deleteMany({ _id: { $in: this.review } });
  next();
});

module.exports = mongoose.model("SingleAnime", AnimeSchema);

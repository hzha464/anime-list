if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const SingleAnime = require("./model/singleAnime");
const Review = require("./model/review");
const cors = require("cors");
const CustomError = require("./util/CustomError");
const multer = require("multer");
const { storage, cloudinary } = require("./cloudinary");
const upload = multer({ storage });
var bodyParser = require("body-parser");
const singleAnime = require("./model/singleAnime");
const JoiSchema = require("./util/Validation");
const app = express();
const path = require("path");
const dbUrl = process.env.DB_URL;
console.log(dbUrl);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../client/build")));

function catchAsync(func) {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
}

mongoose
  // .connect("mongodb://127.0.0.1:27017/Anime-suggest")
  .connect(dbUrl)

  .then(() => {
    console.log("mongo coneection open");
  })
  .catch((err) => {
    console.log("mongo error");
    console.log(err);
  });

app.post(
  "/newAnime",
  upload.single("image"),
  catchAsync(async (req, res, next) => {
    const { error } = JoiSchema.validate(req.body);
    if (error) {
      const {
        statusCode = 500,
        message = "something wrong",
        name = "sorry",
      } = error;
      // res.status(500).json({ statusCode, message, name });
      var err = new Error(message);
      throw err;
    }

    const newAnime = new SingleAnime(req.body);
    newAnime.image = { url: req.file.path, filename: req.file.filename };
    await newAnime.save();
    res.json({ message: "success" });
  })
);

app.get(
  "/allAnime",
  catchAsync(async (req, res) => {
    const allAnime = await SingleAnime.find({});

    res.json({ AllList: allAnime });
  })
);

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get(
  "/animeDetail/:id",
  catchAsync(async (req, res) => {
    const Aid = req.params.id;
    const oneAnime = await SingleAnime.findById(Aid).populate("review");
    res.json({ anime: oneAnime });
  })
);

app.post(
  "/newReview/:animeId",
  upload.none(),
  catchAsync(async (req, res) => {
    // console.dir(req.body);
    // console.log(req.params.animeId);
    const anime = await SingleAnime.findById(req.params.animeId);
    const review = new Review({
      body: req.body.comment,
      rating: req.body.score,
    });
    anime.review.push(review);
    await review.save();
    await anime.save();
    res.json({ status: 200 });
  })
);

app.delete(
  "/:AnimeId",
  catchAsync(async (req, res) => {
    const anime = await singleAnime.findById(req.params.AnimeId);
    await anime.deleteOne();
    const allAnime = await SingleAnime.find({});

    res.json({ AllList: allAnime });

    // const reviews = await Review.find({ _id: { $in: anime.review } });
    // console.log(anime);
    // console.log(anime.review);
  })
);

app.use(async (err, req, res, next) => {
  try {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    next(err);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "something wrong", name = "sorry" } = err;
  // console.log(err.message);
  res.status(500).json({ statusCode, message, name });

  // const { statusCode = 400, message = "something wrong" } = err;
  // if (!err.message) {
  //   err.message = "someting goes wrong";
  // }
  // res.status(statusCode).json({ error: err });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

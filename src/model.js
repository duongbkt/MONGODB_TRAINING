const { ObjectId } = require("bson");
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  name: String,
  email: String,
  movie_id: ObjectId,
  text: String,
  date: Date,
});

const Comment = mongoose.model("comments", CommentSchema);

const MovieSchema = new mongoose.Schema({
  plot: String,
  genres: Array,
  runtime: Number,
  rated: String,
  cast: Array,
  num_mflix_comments: Number,
  poster: String,
  title: String,
  fullplot: String,
  languages: Array,
  released: {
    $date: {
      $numberLong: String,
    },
  },
  directors: Array,
  writers: Array,
  awards: {
    wins: Number,
    nominations: Number,
    text: String,
  },
  lastupdated: Date,
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number,
  },
  countries: Array,
  type: String,
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number,
    },
    lastUpdated: {
      $date: Date,
    },
  },
});

const Movie = mongoose.model("movies", MovieSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("users", UserSchema);

module.exports = { Comment, Movie, User };

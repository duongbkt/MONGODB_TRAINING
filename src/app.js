const mongoose = require("mongoose");
const { Comment, Movie, User } = require("./model");
var prompt = require("prompt-sync")();

const MONGODB_CONNECTION =
  "mongodb+srv://duong:jIEEmtVRSgwlGQiV@cluster0.c6egu.mongodb.net/sample_mflix?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_CONNECTION)
  .then(() => console.log("Kết nối DB thành công"))
  .catch((error) => console.log(error));

// find all movie
const findAllMovie = async () => {
  const data = await Comment.aggregate([
    { $match: {} },
    { $project: { name: 1 } },
    { $limit: 2 },
  ]).exec();
  console.log(data);
};

// find all movie
const findAllMovieByName = async () => {
  var name = prompt("Nhap ten: ");
  prompt.history.save();
  const data = await Comment.find({ name })
    .select({ name: true })
    .limit(2)
    .exec();
  console.log(data);
};

// Find all movies released in a specific year

const findAllMovieByYear = async () => {
  let year = prompt("Nhap năm: ");
  prompt.history.save();
  const data = await Movie.find({ year }).exec();
  console.log(data);
};

// Find all movies with a specific genre

const findAllMovieByGenre = async () => {
  let genres = prompt("Nhap the loai: ");
  prompt.history.save();
  const data = await Movie.find({ genres }).limit(5).exec();
  console.log(data);
};

// Find all movies with a rating greater than or equal to a certain value

const findAllMovieByRating = async () => {
  let rating = prompt("Nhap the giá trị rating: ");
  prompt.history.save();
  const data = await Movie.find({ "imdb.rating": { $gte: rating } })
    .limit(5)
    .exec();
  console.log(data);
};

// Find all movies with a specific actor

const findAllMovieByActor = async () => {
  let actor = prompt("Nhap ten diễn viên: ");
  prompt.history.save();
  const data = await Movie.find({ cast: actor }).exec();
  console.log(data);
};

//Find the top-rated movies released in a specific year
const findTopMovieRatedInYear = async () => {
  let year = prompt("Nhap năm: ");
  prompt.history.save();

  const data = await Movie.find({ year }).sort({ "imdb.rating": -1 }).exec();
  console.log(data);
};

// Find all movies with a runtime greater than or equal to a certain value, sorted by runtime in descending order

const findMovieByRunTime = async () => {
  let runTime = prompt("Nhap thời gian chạy: ");
  prompt.history.save();

  const data = await Movie.find({ runtime: { $gte: runTime } })
    .sort({ runtime: -1 })
    .exec();
  console.log(data);
};

//Find all movies with a specific language and release date between two dates

const findAllMovieWithSpecificLanguage = async () => {
  let languages = prompt("Nhap ngôn ngữ: ");
  prompt.history.save();
  let date1 = prompt("Nhap date 1: ");
  prompt.history.save();
  let date2 = prompt("Nhap date 2: ");
  prompt.history.save();
  const data = await Movie.find({
    languages,
    released: { $lt: new Date(date2), $gt: new Date(date1) },
  }).limit(5).exec();

  console.log(data);
};

//Find the top-rated movies for each genre

const findTopRateMovieForGenre = async () => {
  let genres = prompt("Nhap the loai: ");
  prompt.history.save();
  const data = await Movie.aggregate([
    {
      $match: { genres, "imdb.rating": { $ne: "" } },
    },
    {
      $sort: { "imdb.rating": -1 },
    },
    {
      $addFields: {
        imdb: "$imdb",
      },
    },
  ]).exec();
  console.log(data[0]);
};
//Find the average rating for each movie genre
const findAverageRatingMovieGenre = async () => {
  let genres = prompt("Nhap the loai: ");
  prompt.history.save();

  const data = await Movie.aggregate([
    { $match: { genres } },
    {
      $group: {
        _id: null,
        avg_rating: { $avg: "$imdb.rating" },
      },
    },
    {
      $addFields: {
        genre: genres,
      },
    },
  ]).exec();
  console.log(data);
};

//Find the movie with the highest number of nominations and awards
const findMovieHighestNumberNominationsAndAwards = async () => {
  const maxNominations = await Movie.find({})
    .sort({ "awards.nominations": -1 })
    .limit(1);

  const maxWins = await Movie.find({}).sort({ "awards.wins": -1 }).limit(1);
  const data = await Movie.aggregate([
    {
      $match: {
        $and: [
          {
            "awards.nominations": Number(
              maxNominations.map((i) => i.awards.nominations).join()
            ),
          },
          { "awards.wins": Number(maxWins.map((i) => i.awards.wins).join()) },
        ],
      },
    },
  ]).exec();
  console.log(data);
};

// Find the actors who have appeared in the most movies, sorted by the number of movies they appeared in
const findActorAppearedInTheMostMovie = async () => {
  const data = await Movie.aggregate([
    { $unwind: "$cast" },
    { $group: { _id: "$cast", countMovies: { $sum: 1 } } },
    { $project: { actor: "$_id", countMovies: 1 } },
    { $sort: { countMovies: -1 } },
    { $limit: 10 },
  ]).exec();
  console.log(data);
};

//Find the top-rated movies that were released in the last 5 years, and have a runtime greater than or equal to 2 hours
// 5 năm qua thì không có film nên em để thành 10 cho nó có anh ạ
const finMovieTopRateReleasedIn5Year = async () => {
  const year = new Date().getFullYear();

  const data = await Movie.aggregate([
    {
      $match: {
        "imdb.rating": { $ne: "" },
        $and: [
          { year: { $gt: year - 10 } },
          { year: { $lt: year } },
          { runtime: { $gte: 120 } },
        ],
      },
    },
    {
      $sort: { "imdb.rating": -1 },
    },
    {
      $addFields: {
        imdb: "$imdb",
      },
    },
    { $limit: 3 },
  ]).exec();
  console.log(data);
};

// Find the actors who have appeared in movies with the most number of Oscar nominations

const findActorAppearedInTheMostNumberOfOscarNominations = async () => {
  const movieOscar = await Movie.find({})
    .sort({ "awards.nominations": -1 })
    .limit(1);
  const actor = movieOscar.map((i) => i.cast);
  console.log(actor);
};

// Find the top-rated movies that have won an Oscar for Best Picture, sorted by the year they were released (top10)

const findMovieHaveWonAnOscar = async () => {
  const maxWins = await Movie.find({}).sort({ "awards.wins": -1 }).limit(10);
  const data = maxWins.filter((i) => i);
  const a = data.sort((a, b) => a.year - b.year);

  console.log("🚀 ~ file: app.js:244 ~ findMovieHaveWonAnOscar ~ data:", a);
};

// Write a query to add a new field "imdb_popularity" to all movies in the "movies" collection.
// The value of "imdb_popularity" should be calculated as the sum of the "imdb.votes" and "imdb.rating" fields.

const addImdbPopularity = async () => {
  const create = await Movie.updateMany(
    {},
    [
      {
        $set: {
          imdb_popularity: { $sum: ["$imdb.votes", "$imdb.rating"] },
        },
      },
    ],
    { upsert: true, multi: true }
  );
  console.log(create);
};

// Update all comments made by users whose username starts with "J" to have a new field "moderator_approved" set to true.

const updateAllCommentUserNameStartJ = async () => {
  const data = await Comment.updateMany(
    { name: { $regex: /^J/ } },

    {
      $set: {
        moderator_approved: true,
      },
    },
    {
      $limit: 5,
    }
  );
  console.log(data);
};

// Write a query to update all movies that have the word "thriller" in their "genres" field to also include the "suspense" genre.
const updateThrillerToSuspense = async () => {
  const data = await Movie.updateMany(
    { genres: "Suspense" },
    {
      $set: {
        genres: "Thriller",
      },
    },
    {
      multi: true,
    }
  );
  console.log(data);
};

// Update the "awards.wins" field of all movies that have won an Academy Award to be incremented by 1.

const updateAcademyAward = async () => {
  const data = await Movie.updateMany(
    { "awards.wins": { $gt: 0 } },
    { $inc: { "awards.wins": 1 } },
    {
      multi: true,
    }
  );
  console.log(data);
};

// Write a query to update all movies released before 1990 to have a new field "old_movie" set to true
const updateReleasedBefore1990 = async () => {
  const data = await Movie.updateMany(
    { year: { $lt: 1990 } },
    [
      {
        $addFields: {
          old_movie: true,
        },
      },
    ],
    { upsert: true }
  );
  console.log(data);
};

// Write a query to update the "tomato" field for all movies in the "movies" collection.
// The new "tomato" field should have two subfields, "meter" and "reviews".
// The "meter" subfield should have the value of the "tomatoes.meter" field, and the "reviews" subfield should have an array of all "tomatoes.reviews" objects.

const updateTheTomatoField = async () => {
  const data = await Movie.updateMany(
    {},
    [
      {
        $set: {
          tomato: {
            meter: "$tomatoes.viewer.meter",
            reviews: ["$tomatoes.viewer"],
          },
        },
      },
    ],
    { upsert: true }
  );
  console.log(data);
};
// Update all comments made by users whose email domain is "gameofthron.es" to have a new field "flagged" set to true.

const updateCommentsWithDomainExample = async () => {
  const data = await User.updateMany(
    { email: { $regex: /gameofthron.es/ } },
    [
      {
        $set: {
          flagged: true,
        },
      },
    ],
    { upsert: true }
  );
  console.log(data);
};
//  Write a query to update all movies that have a "runtime" field greater than 120 to also have a new field "blockbuster" set to true.

const updateMovieThatHaveRuntimeFieldGreaterThan120 = async () => {
  const data = await Movie.updateMany(
    { runtime: { $gt: 120 } },
    [
      {
        $addFields: {
          blockbuster: true,
        },
      },
    ],
    { upsert: true }
  );
  console.log(data);
};

// Update the "imdb.votes" field of all movies that have a "tomatoes.viewer.numReviews" field greater than 500 to be incremented by 100.
const updateImdbVotesField = async () => {
  const data = await Movie.updateMany(
    { "tomatoes.viewer.numReviews": { $gt: 500 } },
    [
      {
        $set: {
          "imdb.votes": { $sum: ["imdb.votes", 100] },
        },
      },
    ],
    { upsert: true }
  );
  console.log(data);
};

// Write a query to update all movies that have the word "action" in their "genres" field to also include the "adventure" and "thriller" genres.
const updateAllMoviesThatHaveTheWordAction = async () => {
  const data = await Movie.updateMany(
    { genres: "Action" },
    {
      $push: { genres: { $each: ["Adventure", "Thriller"] } },
    }
  );
  console.log(data);
};

const main = async () => {
  let next = true;
  while (next) {
    next = false;
    var input = prompt("Nhap ham muon chay: ");
    prompt.history.save();

    switch (Number(input)) {
      case 1:
        await findAllMovie();
        break;
      case 2:
        await findAllMovieByName();
        break;
      case 3:
        await findAllMovieByYear();
        break;
      case 4:
        await findAllMovieByGenre();
        break;
      case 5:
        await findAllMovieByRating();
        break;
      case 6:
        await findAllMovieByActor();
        break;
      case 7:
        await findTopMovieRatedInYear();
        break;
      case 8:
        await findMovieByRunTime();
        break;
      case 9:
        await findAllMovieWithSpecificLanguage();
        break;
      case 10:
        await findTopRateMovieForGenre();
        break;
      case 11:
        await findAverageRatingMovieGenre();
        break;
      case 12:
        await findMovieHighestNumberNominationsAndAwards();
        break;
      case 13:
        await findActorAppearedInTheMostMovie();
        break;
      case 14:
        await finMovieTopRateReleasedIn5Year();
        break;
      case 15:
        await findActorAppearedInTheMostNumberOfOscarNominations();
        break;
      case 16:
        await findMovieHaveWonAnOscar();
        break;
      // case 17:
      // await findMovieHaveWonAnOscar();
      // break;
      case 18:
        await addImdbPopularity();
        break;
      case 19:
        await updateAllCommentUserNameStartJ();
        break;
      case 20:
        await updateThrillerToSuspense();
        break;
      case 21:
        await updateAcademyAward();
        break;
      case 22:
        await updateReleasedBefore1990();
        break;
      case 23:
        await updateTheTomatoField();
        break;
      case 24:
        await updateCommentsWithDomainExample();
        break;
      case 25:
        await updateMovieThatHaveRuntimeFieldGreaterThan120();
        break;
      case 26:
        await updateImdbVotesField();
        break;
      case 27:
        await updateAllMoviesThatHaveTheWordAction();
        break;

      case 0:
        process.exit();
      default:
        break;
    }

    next = true;
  }
};

main();

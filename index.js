import express from 'express';
import mongoose from 'mongoose';

import Games from "./models/Game.js"
import Reviews from "./models/Review.js"
import Users from "./models/User.js"

import "dotenv/config"
import Game from './models/Game.js';


const app = express();
const PORT = process.env.PORT;

await mongoose.connect(process.env.MONGODB_URI)

app.use(express.json());


//GET ROUTES

//Games

app.get("/games" , async (req , res) => {

    const { genre , developer, platform, minRating, sortBy, limit} = req.query;
    const query = {};

       
        if(genre) query.genre = {$regex: genre , $options: "i"};
        if(developer) query.developer = {$regex: developer , $options: "i"};
        if(platform) query.platform = {$regex: platform , $options: "i"};
        if(minRating) query.averageRating = {$gte: parseFloat(minRating)};
    
    let sort = {createdAt: -1};

        if(sortBy === "rating") sort = {averageRating: -1};
        if(sortBy === "release") sort = {releaseDate: -1};
        if(sortBy === "title") sort = {title: 1};

    let games = await Games.find(query)

        .sort(sort)
        .limit(parseInt(limit)|| 5);

        res.json(games);
});

app.get("/games/:title" , async ( req ,res) => {
    
    let title = req.params.title.trim();
    let game = await Games.find({title: {$regex: title , $options: "i"}
    
    });

    if(!game) 
        return res.status(404).json({message: "Game Not Found"});
    
    res.json(game);
});


//Reviews


app.get("/reviews" , async (req , res) => {

    let reviews = await Reviews.find().populate("user" , "username avatar").populate("game" , "title coverImage");

    res.json(reviews);
});

app.get("/reviews/:game" , async (req , res) => {

    const {sortBy ,  limit} = req.query;

    const trimmedSortBy = sortBy ? sortBy.trim() : undefined;

    let sort = {createdAt: -1};

        if(sortBy === "rating") sort = {rating: -1};
        if(sortBy === "oldest") sort = {createdAt: 1};

        let game = await Game.findOne({title: {$regex: req.params.game , $options: "i"}});

        if(!game) 
            return res.status(404).json({message: "Game Not Found"});

        let gameId =game._id

        let reviews = await Reviews.find({game: gameId})

        .sort(sort)
        .limit(parseInt(limit) || 5)
        .populate("user" , "username avatar")
        .populate({path: "game" , select: "title coverImage"});

        res.json(reviews);
});

app.get("/reviews/users/:id" , async (req , res) => {

    let reviews = await Reviews.find({user: req.params.id})

        .sort({createdAt: -1})
        .populate("game" , "title coverImage");

        res.json(reviews);
});


//Users

app.get("/users" , async (req , res) => {

    let user = await Users.find().select("-email");

        res.json(user);
});

app.get("/users/:id" , async (req , res) => {

    let user = await Users.findOne({_id: req.params.id}).select("-email");

    if(!user)
        return res.status(404).json({message: "User Not Found"});

    res.json(user);
});




//POST ROUTES

//Games

app.post("/games" , async (req , res) => {

    let game = new Game(req.body);
    let savedGame = await game.save();

        res.status(201).json(savedGame);
});

//Reviews

app.post("/reviews" , async (req , res) => {

    let review = new Reviews(req.body);
    let savedReview = await review.save();

    await updateAverage(review.game);

        res.status(201).json(savedReview);
});

//Users

app.post("/users" , async (req , res) => {

    let user = new Users(req.body);
    let savedUser = await user.save();

    let userReturn = savedUser.toObject();
    delete userReturn.email;

        res.status(201).json(userReturn);
});



//PATCH ROUTES

//Games

app.patch("/games/:id" , async (req , res) => {
    let gameId = req.params.id;

    let game = await Games.findOne({_id: gameId});

    if(!game)
        return res.status(404).json({message: "Game Not Found"});

    let updateData = {...req.body};
    delete updateData._id;

    game = await Games.findByIdAndUpdate(gameId , updateData , {new: true}); 

    res.json(game);
});


//Reviews

app.patch("/reviews/:id" , async (req ,res) => {
     let reviewId = req.params.id;

    let review = await Reviews.findOne({_id: reviewId});

    if(!review)
        return res.status(404).json({message: "Review Not Found"});

    let updateData = {...req.body};
    delete updateData._id;

    review = await Reviews.findByIdAndUpdate(reviewId , updateData ,  {new: true});



        res.json(review);
})


//Users

app.patch("/users/:id" , async (req ,res) => {

    let user = await Users.findOne({_id: req.params.id});
      
    if(!user)
        return res.status(404).json({message: "User Not Found"});

    let updateData = {...req.body};
    delete updateData._id;

    user = await Users.findByIdAndUpdate(req.params.id , updateData , {new: true , select: "-email"});

    res.json(user);
});



//DELETE ROUTES

//Games

app.delete("/games/:id" , async (req , res) => {
    let gameId = req.params.id;

    let game = await Games.findOneAndDelete({_id: gameId});

    if(!game)
        return res.status(404).json({message: "Game Not Found"});

    res.json({message: "Game Deleted"});
});


//Reviews

app.delete("/reviews/:id" , async (req , res) => {
    let reviewId = req.params.id;

    let review = await Reviews.findOneAndDelete({_id: reviewId});

    if(!review)
        return res.status(404).json({message: "Review Not Found"});

    await updateAverage(review.game);

        res.json({message: "Review Deleted"});
});


//Users

app.delete("/users/:id" , async (req , res) => {

    let user = await Users.findOneAndDelete({_id: req.params.id});

    if(!user)
        return res.status(404).json({message: "User Not Found"});
    
    res.json({message: "User Deleted"});
});






//Average Score

async function updateAverage(gameId) {
    
    let result = await Reviews.aggregate([
            {$match: {game: gameId}} ,
            {$group: {_id: null , averageRating: {$avg: "$rating"}}} ,
    ]);

    let reviewCount = await Reviews.countDocuments({game: gameId});

   await Game.findOneAndUpdate(
        {_id: gameId} ,
        {averageRating: result.length > 0 ? result[0].averageRating : 0 , reviewCount: reviewCount} ,
        {new: true}
   );

}



app.listen(PORT , () => {
    console.log("Server running on port" , PORT);
});


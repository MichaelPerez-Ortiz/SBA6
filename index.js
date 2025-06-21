import express from 'express';
import mongoose from 'mongoose';

import Games from "./models/Game.js"
import Reviews from "./models/Review.js"
import Users from "./models/User.js"

import "dotenv/config"


const app = express();
const PORT = process.env.PORT;

await mongoose.connect(process.env.MONGODB_URL)

app.use(express.json());


//GET ROUTES

//Games

app.get("/games" , async (req , res) => {

    const {title , genre , developer, platform, minRating, sortBy, limit} = req.query;
    const query = {};

        if(title) query.$text = {$search: title};
        if(genre) query.genre = {$in: Array.isArray(genre) ? genre: [genre]};
        if(developer) query.developer = developer;
        if(platform) query.platform = {$in: Array.isArray(platform) ? platform: [platform]};
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
    let game = await Games.findOne({title: title});

    if(!game) 
        return res.status(404).json({message: "Game not Found"});
    
    res.json(game);
});


//Reviews

app.get("/reviews/:title" , async (req , res) => {

    const {sortBy ,  limit} = req.query;

    let sort = {createdAt: -1};

        if(sortBy === "rating") sort = {rating: -1};
        if(sortBy === "oldest") sort = {createdAt: 1};

        let reviews = await Reviews.find({game: title})

        .sort(sort)
        .limit(parseInt(limit) || 5)
        .populate("user" , "username avatar");

        res.json(reviews);
});

app.get("/reviews/:username" , async (req , res) => {

    let reviews = await Reviews.find({user: user.username})

        .sort({createdAt: -1})
        .populate("game" , "title coverImage");

        res.json(reviews);
});


//Users

app.get("/users" , async (req , res) => {

    let user = await Users.find().select("-email");

        res.json(user);
});

app.get("/users/:username" , async (req , res) => {

    let username =req.params.username;
    let user = await Users.findOne({username: username}).select("-email");

    if(!user)
        return res.status(404).json({message: "User Not Found"});

    res.json(user);
});











app.listen(PORT , () => {
    console.log("Server running on port" , PORT);
});


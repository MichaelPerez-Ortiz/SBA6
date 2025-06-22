import express from 'express';
import mongoose from 'mongoose';

import Games from "./models/Game.js"
import Reviews from "./models/Review.js"
import Users from "./models/User.js"

import "dotenv/config"
import Game from './models/Game.js';


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
    let game = await Games.findOne({title: {$regex: title , $options: "i"}
    
    });

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

        let reviews = await Reviews.find({game: {$regex: req.params.title , $options: "i"}})

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






//Average Score

async function updateAverage(title) {
    
    let result = await Reviews.aggregate([
            {$match: {game: title}} ,
            {$group: {_id: null , averageRating: {$avg: "$rating"}}} ,
    ]);

   await Game.findOneAndUpdate(
        {title: title} ,
        {averageRating: result.length > 0 ? result[0].averageRating : 0 , $inc: {reviewCount: 1}} ,
        {new: true}
   );

}



app.listen(PORT , () => {
    console.log("Server running on port" , PORT);
});


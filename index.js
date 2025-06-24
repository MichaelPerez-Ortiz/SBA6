import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import Games from "./models/Game.js"
import Reviews from "./models/Review.js"
import Users from "./models/User.js"

import "dotenv/config"
import Game from './models/Game.js';


const app = express();
const PORT = process.env.PORT;

await mongoose.connect(process.env.MONGO_URI)

app.use(express.json());


//GET ROUTES

//Games

app.get("/games" , async (req , res) => {
try {

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
} catch (error) {
    res.status(500).json({message: "Error Getting Games"});
}

});

app.get("/games/:title" , async ( req ,res) => {
try {

    let title = req.params.title.trim();
    let game = await Games.find({title: {$regex: title , $options: "i"}
    
    });

    if(!game) 
        return res.status(404).json({message: "Game Not Found"});
    
    res.json(game);
} catch (error) {
    res.status(500).json({message: "Error Getting Games"});
}
   
});


//Reviews


app.get("/reviews" , async (req , res) => {
try {

    let reviews = await Reviews.find().populate("user" , "username avatar").populate("game" , "title coverImage");

    res.json(reviews);
} catch (error) {
    res.status(500).json({message: "Error Getting Reviews"});
}

});

app.get("/reviews/:game" , async (req , res) => {
try {

    const {sortBy ,  limit} = req.query;

    

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
} catch (error) {
    res.status(500).json({message: "Error Getting Reviews"});
}

});

app.get("/reviews/users/:id" , async (req , res) => {
try {

    let reviews = await Reviews.find({user: req.params.id})

        .sort({createdAt: -1})
        .populate("game" , "title coverImage");

        res.json(reviews);
} catch (error) {
    res.status(500).json({message: "Error Getting Reviews"});
}

});


//Users

app.get("/users" , async (req , res) => {
try {

    let user = await Users.find().select("-email -password");

        res.json(user);
} catch (error) {
    res.status(500).json({message: "Error Getting Users"});
}

});

app.get("/users/:id" , async (req , res) => {
try {

    let user = await Users.findOne({_id: req.params.id}).select("-email -password");

    if(!user)
        return res.status(404).json({message: "User Not Found"});

    res.json(user);
} catch (error) {
    res.status(500).json({message: "Error Getting User"});
}

});




//POST ROUTES

//Games

app.post("/games" , async (req , res) => {
try {

    let game = new Game(req.body);
    let savedGame = await game.save();

        res.status(201).json(savedGame);
} catch (error) {
    res.status(400).json({message: "Error Adding Game"});
}

});

//Reviews

app.post("/reviews" , async (req , res) => {
try {

    let review = new Reviews(req.body);
    let savedReview = await review.save();

    await updateAverage(review.game);

        res.status(201).json(savedReview);
} catch (error) {
    res.status(400).json({message: "Error Adding Review"});
}

});

//Users

app.post("/users" , async (req , res) => {
try {

    let hashedPassword = await bcrypt.hash(req.body.password , 12);
    let userData = {
        ...req.body ,
        password: hashedPassword
    };

    let user = new Users(userData);
    let savedUser = await user.save();

    let userReturn = savedUser.toObject();
    delete userReturn.email;
    delete userReturn.password;

        res.status(201).json(userReturn);
} catch (error) {
    res.status(400).json({message: "Error Adding User"});
}

});



//PATCH ROUTES

//Games

app.patch("/games/:id" , async (req , res) => {
try {

    let gameId = req.params.id;

    let game = await Games.findOne({_id: gameId});

    if(!game)
        return res.status(404).json({message: "Game Not Found"});

    let updateData = {...req.body};
    delete updateData._id;

    game = await Games.findByIdAndUpdate(gameId , updateData , {new: true}); 

    res.json(game);
} catch (error) {
    res.status(400).json({message: "Error Updating Game"});
}

});


//Reviews

app.patch("/reviews/:id" , async (req ,res) => {
try {

     let reviewId = req.params.id;

    let review = await Reviews.findOne({_id: reviewId});

    if(!review)
        return res.status(404).json({message: "Review Not Found"});

    let updateData = {...req.body};
    delete updateData._id;

    review = await Reviews.findByIdAndUpdate(reviewId , updateData ,  {new: true});



        res.json(review);
} catch (error) {
    res.status(400).json({message: "Error Updating Review"});
}

})


//Users

app.patch("/users/:id" , async (req ,res) => {
try{

    let user = await Users.findOne({_id: req.params.id});
      
    if(!user)
        return res.status(404).json({message: "User Not Found"});

    let updateData = {...req.body};
    delete updateData._id;

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password , 12);
    }

    user = await Users.findByIdAndUpdate(req.params.id , updateData , {new: true , select: "-email -password"});

    res.json(user);
} catch (error) {
    res.status(400).json({message: "Error Updating User"});
}

});



//DELETE ROUTES

//Games

app.delete("/games/:id" , async (req , res) => {
try {

    let gameId = req.params.id;

    let game = await Games.findOneAndDelete({_id: gameId});

    if(!game)
        return res.status(404).json({message: "Game Not Found"});

    res.json({message: "Game Deleted"});
} catch (error) {
    res.status(500).json({message: "Error Deleting Games"});
}
       
});


//Reviews

app.delete("/reviews/:id" , async (req , res) => {
try {

    let reviewId = req.params.id;

    let review = await Reviews.findOneAndDelete({_id: reviewId});

    if(!review)
        return res.status(404).json({message: "Review Not Found"});

    await updateAverage(review.game);

        res.json({message: "Review Deleted"});
} catch (error) {
    res.status(500).json({message: "Error Deleting Review"});
}

});


//Users

app.delete("/users/:id" , async (req , res) => {
try {

    let user = await Users.findOneAndDelete({_id: req.params.id});

    if(!user)
        return res.status(404).json({message: "User Not Found"});
    
    res.json({message: "User Deleted"});
} catch (error) {
    res.status(500).json({message: "Error Deleting User"});
}

});






//Average Score

async function updateAverage(gameId) {
try {

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

} catch (error) {
        console.error("Error Updating Average Rating:" , error);
    }

}



app.listen(PORT , () => {
    console.log("Server running on port" , PORT);
});


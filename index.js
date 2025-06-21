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










app.listen(PORT , () => {
    console.log("Server running on port" , PORT);
});


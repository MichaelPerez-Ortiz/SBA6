import express from 'express';
import mongoose from 'mongoose';
import "dotenv/config"


const app = express();
const PORT = process.env.PORT;

await mongoose.connect(process.env.MONGODB_URL)

app.use(express.json());










app.listen(PORT , () => {
    console.log("Server running on port" , PORT);
});


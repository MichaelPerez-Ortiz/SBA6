import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({

    game: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "Game" ,
        required: true ,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" ,
        required: true ,
    },

    rating: {
        type: Number ,
        required: true ,
        min: [1 , "Rating can't be less than 1"] ,
        max: [10 , "Rating can't be greater than 10"] ,
    },
    
    review: {
        type: String ,
        required: true ,
        trim: true ,
        minlength: [20 , "Review must be at least 20 characters."] ,
        maxlength: [2000 , "Review can't exceed 2000 characters"] ,
    },

    // likes: {
    //     type: Number ,
    //     default: 0 ,
    //     min: 0 ,
    // },
}, 
{timestamps: true});

//Indexes

reviewSchema.index({game: 1 , user: 1} , {unique: true});
reviewSchema.index({createdAt: -1});
reviewSchema.index({rating: -1});



export default mongoose.model("Review" , reviewSchema);
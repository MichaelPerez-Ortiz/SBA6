import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({

    title: {
        type: String ,
        required: true ,
        trim: true ,
        maxlength: 100 ,
        minlength: 1 ,
    },

    developer: {
        type: String ,
        trim: true ,
        maxlength: 100 ,
    },
    releaseDate: {
        type: Date ,
    },

    genre: {
        type: [String] ,
    },

    platform: {
        type: [String] ,
        required: [true, "Specify at least one platform"] ,
        validate: {
            
            validator: function (platforms) {
                return platforms.length > 0;
            },
            message: "At least one platform is required" ,
        },
    },

    averageRating: {
        type: Number ,
        required: true , 
        min: [1 , "Rating can't be less than 1"] ,
        max: [10 , "Rating can't be greater than 10"] ,
    },

    description: {
        type: String ,
        trim: true ,
        minlength: [10 , "Description must be at least 10 characters"] ,
    },

    coverImage: {
        type: String ,
        default: "" ,
    },
},
{timestamps:true});

//Indexes

gameSchema.index({title: "text"});
gameSchema.index({genre: 1});
gameSchema.index({developer: 1});
gameSchema.index({averageRating: -1});
gameSchema.index({releaseDate: -1});


export default mongoose.model("Game" , gameSchema);
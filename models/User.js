import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username: {
        type: String ,
        required: true ,
        unique: true ,
        trim: true ,
        minlength: 1 ,
        maxlength: [30 , "Username must be at max 30 characters"] ,
    },

    email: {
        type: String ,
        required: true ,
        unique: true ,
        trim: true ,
    },

    avatar: {
        type: String ,
        default: "" ,
    },
}, 
{timestamps: true});


//Indexes

userSchema.index({username: 1});
userSchema.index({email: 1} , {unique: true});



export default mongoose.model("User" , userSchema);
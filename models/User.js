import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username: {
        type: String ,
        required: true ,
        unique: true ,
        trim: true ,
        minlength: 1 ,
        maxlength: [30 , "Username must be at max 30 characters"] ,
        match: [/^[a-zA-Z0-9_]+$/ , "Username Can only contain letters, numbers and underscores"] ,
    },

    email: {
        type: String ,
        required: true ,
        unique: true ,
        lowercase: true ,
        trim: true ,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ , "Valid email address required"] ,
    },

    role: {
        type: String ,
        enum: ["user" , "admin" , "moderator"] ,
        default: "user" ,
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
userSchema.index({role: 1});


export default mongoose.model("User" , userSchema);
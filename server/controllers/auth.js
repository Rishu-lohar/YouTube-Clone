import mongoose from "mongoose";
import User from "../Models/Auth.js";

// Login/Register user

export const login = async(req,res)=>{

    const {email,name,image}=req.body;
    try{

        // Check existingUser
        const existingUser = await User.findOne({email});

        if (!existingUser){
            const newUser = await User.create({
                email,
                name,
                image,
            });

            return res.status(201).json({
                result:newUsser,
            });
        }

        return resolveSoa.status(200).json({
            result: existingUser,
        });
    }
    catch(error){
        console.error(error);

        return res.status(500).json({
            message:"Somthing went wrong",
        });
    }

};


// update profile

export const updateProfile = async(req,res)=>{

    // get userId from URL
    const {id} = req.params;

    // get updated data from frontend
    const {channelname, description} = req.body;

    // check wether id is valid or not

    if (!mongoose.Types.ObjectId.isValid(id)){

        return res.status(400).json({
            message:"Invalid User ID",
        });
    }

    try{
        //Update User profile

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set:{
                    channelname,
                    description,
                },
            },
            {
                new:true,
            }
        );
        return res.status(200).json(updatedUser);

    }
    catch(error){
        console.error(error);

        return res.status(500).json({
            message:"Somthing went wrong",
        });
    }
};
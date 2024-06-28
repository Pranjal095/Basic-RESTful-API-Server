const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://127.0.0.1:27017/userdb");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },

    password:{
        type: String,
        required: true
    }
})

const User = mongoose.model("User",userSchema);

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/views/NewUser.html");
})

app.post("/users",async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const isExisting = await User.findOne({ username: username });
    if(isExisting){
        res.send("User with given username already exists. Try again with a different one.");
    }
    else{
        const user = new User({
            username: username,
            password: password
        })

        try{
            await user.save();
            res.send("User successfully added.")
        }
        catch(err){
            console.log(err);
            res.send("An error occurred while adding the user to the database.");
        }
    }
})

app.put("/:username",async(req,res)=>{
    const username = req.params.username;
    const existingPassword = req.body.existingPassword;
    const newPassword = req.body.newPassword;
    if(!existingPassword || !newPassword){
        res.send("One of the passwords could not be obtained from request body. Try again.");
    }
    else{
        const userToUpdate = await User.findOne({ username: username });
        if(!userToUpdate){
            res.send("User with given username does not exist in database.");
        }
        else{
            if(userToUpdate.password!==existingPassword){
                res.send("Authentication failed. Kindly enter the correct existing password.");
            }
            else{
                userToUpdate.password = newPassword;
                try{
                    await userToUpdate.save();
                    res.send("User password successfully updated.")
                }
                catch(err){
                    console.log(err);
                    res.send("An error occurred while updating the user's password.");
                }
            }
        }
    }
})

app.delete("/:username",async(req,res)=>{
    const username = req.params.username;
    const password = req.body.password;
    if(!password){
        res.send("Password could not be obtained from request body. Try again.");
    }
    else{
        const userToDelete = await User.findOne({ username: username });
        if(!userToDelete){
            res.send("User with given username does not exist in database.");
        }
        else{
            if(userToDelete.password!==password){
                res.send("Authentication failed. Kindly enter the correct existing password.");
            }
            else{
                try{
                    await User.deleteOne({ username: username });
                    res.send("User successfully deleted from database.")
                }
                catch(err){
                    console.log(err);
                    res.send("An error occurred while deleting the user from the database.");
                }
            }
        }
    }
})


app.listen(PORT,()=>{
    console.log("Server is running on port "+PORT);
})

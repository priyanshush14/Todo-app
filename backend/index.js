const express = require(`express`);
const jwt = require(`jsonwebtoken`);
const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const { z } = require(`zod`);
require("dotenv").config();
const { UserModel, TodoModel } = require("./Db");
const JWT_SECRET = "ilovetodos";

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI) 
    .then(() => {
        console.log("MongoDb connected successfully");
    })
    .catch((err) => {
        console.error("MongoDb connection error:", err);
    });


app.post("/signup", async (req, res) => {
    // schema for input validation.
    const requiredbody = z.object ({
        username: z.string().min(6).max(12),
        //This will only allow password if the password has uppercase & special charcters. 
        password: z.string().min(8).max(20).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/),
        name: z.string().min(3)
    })

    const parseddata = requiredbody.safeParse(req.body);

    if(!parseddata.success) {
        return res.status(201).json({
            message: "Incorrect format of Username and Password!",
            error: parseddata.error
        });
    }

    const { username, password, name } = parseddata.data;

    try {
        //This will hash the password with 8 salting.
        const hashedpass = await bcrypt.hash(password , 8);

        await UserModel.create({
            username: username,
            password: hashedpass,
            name: name
        });

        res.status(200).json({
            message: "you are signed up!"
        });
    }
    catch (error) {
        console.error("SIGNUP ERROR:", error);

        if (error.code === 11000) {
           return res.status(409).json({
               message: "Username not available!"
           });
        }  

        return res.status(500).json({
            message: "Server error!"
        });
    }
});

app.listen(3000);
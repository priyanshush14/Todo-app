const express = require(`express`);
const jwt = require(`jsonwebtoken`);
const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const { z } = require(`zod`);
const { UserModel, TodoModel } = require("./Db");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
console.log("JWT SECRET LOADED:", !!JWT_SECRET);
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI) 
    .then(() => {
        console.log("MongoDb connected successfully");
    })
    .catch((err) => {
        console.error("MongoDb connection error:", err);
    });


app.post("/signup", inputvalidator_signup, async (req, res) => {
    const { username, password, name } = req.validateddata;

    try {
        //This will hash the password with 8 salting.
        const hashedpass = await bcrypt.hash(password , 8);

        await UserModel.create({
            username: username,
            password: hashedpass,
            name: name
        });

        res.status(201).json({
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

app.post("/signin", inputvalidator_signin, async (req, res) => {
    const { username, password } = req.validateddata;

    try {
        const response = await UserModel.findOne({
            username: username
        })
        
        if(!response) {
            return res.status(401).json({
                message: "username does not exist!"
            });
        }

        const passwordmatch = await bcrypt.compare(password, response.password);

        if(passwordmatch) {
            const token = jwt.sign({
                id: response._id.toString()
            }, JWT_SECRET);

            res.json({
                token: token
            });
        } else {
            return res.status(401).json({
                message: "invalid credentials"
            });
        }
    }
    catch (error) {
        console.error("SIGNIN ERROR:", error);

        return res.status(500).json({
            message: "Server error!"
        });
    }
})

app.post("/create_todo", auth, async (req, res) => {
    const requiredtitle = z.object({
        title: z.string().min(2).max(300)
    });

    const parsedtitle = requiredtitle.safeParse(req.body);

    if(!parsedtitle.success) {
        return res.status(400).json({
            message: "Todo title must be between 2 and 300 characters",
            error: parsedtitle.error
        });
    }

    const userid = req.userid;
    const rawTitle = parsedtitle.data.title;
    const normalizedTitle = rawTitle.trim();

    if (normalizedTitle.length < 2) {
        return res.status(400).json({
            message: "Todo title must be between 2 and 300 characters"
        });
    }

    try {
        const escapedTitle = normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingTodo = await TodoModel.findOne({
            userid: userid,
            title: { $regex: new RegExp(`^\\s*${escapedTitle}\\s*$`, "i") }
        });

        if (existingTodo) {
            return res.status(409).json({
                message: "Todo already exists"
            });
        }

        const todo = await TodoModel.create({
            title: normalizedTitle,
            userid: userid
        });

        res.status(201).json({
            message: "todo created successfully!",
            todo: todo
        });
    }
    catch (error) {
        console.error("CREATE TODO ERROR:", error);
        res.status(500).json({
            message: "database error"
        });
    }
});

app.get("/retrive_todo", auth, async (req, res) => {
    const userid = req.userid;
    try {
        const todos = await TodoModel.find({
            userid: userid
        });

        res.status(200).json({
            todos
        });
    }
    catch (error) {
        res.status(500).json({
            message: "unable to fetch!"
        });
    }
});

app.get("/me", auth, async (req, res) => {
    const userid = req.userid;

    try {
        const user = await UserModel.findById(userid);

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        res.status(200).json({
            name: user.name,
            username: user.username
        });
    }
    catch (error) {
        console.error("ME ERROR:", error);
        res.status(500).json({
            message: "Server error!"
        });
    }
});

app.put("/update_todo/:id", auth, async (req, res) => {
    const newresponse = z.object({
        newtitle: z.string().min(2).max(300)
    });

    const parsednewtitle = newresponse.safeParse(req.body);
    if (!parsednewtitle.success) {
        return res.status(400).json({
                   message: "Invalid todo title",
                   error: parsednewtitle.error
                });
    }
    const userid = req.userid;
    const todoid = req.params.id;
    const newtitle = parsednewtitle.data.newtitle;
    
    try {
        const updatedtodo = await TodoModel.findOneAndUpdate(
            {
                _id: todoid,
                userid: userid
            },
            {
                title: newtitle
            }
        )
        
        if(updatedtodo) {
            res.status(200).json({
                message: "todo updated successfully!"
            });
        } else {
            return res.status(404).json({
                message: "Todo not found"
            });
        }
    }
    catch (err) {
        console.log("UPDATION ERROR OCCURED:", err);
        res.status(500).json({
            message: "wasnt able to update todo"
        });
    }
});

app.put("/update_todo_status/:id", auth, async (req, res) => {
    const statusSchema = z.object({
        done: z.boolean()
    });

    const parsedStatus = statusSchema.safeParse(req.body);
    if (!parsedStatus.success) {
        return res.status(400).json({
            message: "Invalid status format",
            error: parsedStatus.error
        });
    }

    const userid = req.userid;
    const todoid = req.params.id;
    const done = parsedStatus.data.done;

    try {
        const updatedtodo = await TodoModel.findOneAndUpdate(
            {
                _id: todoid,
                userid: userid
            },
            {
                done: done
            }
        );

        if (updatedtodo) {
            res.status(200).json({
                message: "todo status updated successfully!"
            });
        } else {
            return res.status(404).json({
                message: "Todo not found"
            });
        }
    }
    catch (err) {
        console.log("STATUS UPDATION ERROR OCCURED:", err);
        res.status(500).json({
            message: "wasnt able to update todo status"
        });
    }
});

app.delete("/delete_todo/:id", auth, async (req, res) => {
    const userid = req.userid;
    const todoid = req.params.id;
    
    try {
        const deletedtodo = await TodoModel.findOneAndDelete({
            _id: todoid,
            userid: userid
        })
        if(deletedtodo) {
            return res.status(200).json({
                message: "todo deleted successfully!"
            });
        } else {
            return res.status(404).json({
                message: "todo not found!"
            });
        }
    }
    catch (err) {
        console.log("deletion ERROR OCCURED:", err);
        res.status(500).json({
            message: "wasnt able to delete todo"
        });
    }
});

function inputvalidator_signup(req,res,next){
    const requiredbody = z.object ({
        username: z.string().min(6).max(12),
        //This will only allow password if the password has uppercase & special charcters. 
        password: z.string().min(8).max(20).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/),
        name: z.string().min(3)
    })

    const parseddata = requiredbody.safeParse(req.body);

    if(!parseddata.success) {
        return res.status(400).json({
            message: "Incorrect format of Username and Password!",
            error: parseddata.error
        });
    }

    req.validateddata = parseddata.data;
    return next();
}

function inputvalidator_signin(req,res,next){
    const requiredbody = z.object ({
        username: z.string().min(6).max(12),
        //This will only allow password if the password has uppercase & special charcters. 
        password: z.string().min(8).max(20).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/),
    })

    const parseddata = requiredbody.safeParse(req.body);

    if(!parseddata.success) {
        return res.status(400).json({
            message: "Incorrect format of Username and Password!",
            error: parseddata.error
        });
    } 

    req.validateddata = parseddata.data;
    return next();

}

function auth(req, res, next) {
    const token = req.headers.token;

    try {
        const decodeddata = jwt.verify(token, JWT_SECRET);

        req.userid = decodeddata.id;

        next();

    } catch (err) {
        console.error("Authentication error:", err);

        return res.status(401).json({
            message: "invalid credentials"
        });
    }
}

app.listen(3000);
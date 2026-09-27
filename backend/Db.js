const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const User = new Schema ({
    username: {type: String, unique: true},
    password: String,
    name: String
});

const Todo = new Schema ({
    title: String,
    done: {
        type: Boolean,
        default: false
    },
    userid: {
        type: ObjectId,
        ref: "users"
    }
});

const UserModel = mongoose.model('users', User);
const TodoModel = mongoose.model('todos', Todo);

module.exports = {
    UserModel: UserModel,
    TodoModel: TodoModel
};
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupModel",
        default: null
    }
})
module.exports = mongoose.model('UserModel', userSchema);

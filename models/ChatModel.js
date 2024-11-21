// ChatModel.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupModel',
        required: true
    },

    //todo, add refs
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatModel', chatSchema);

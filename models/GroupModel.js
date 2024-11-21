const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true,
    },
    
    users: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }],

    tasks: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'TaskModel'
    }]

})

module.exports = mongoose.model('GroupModel', groupSchema);
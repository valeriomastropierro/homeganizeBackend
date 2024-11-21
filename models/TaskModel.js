const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({


    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    isCompleted: {
        type: Boolean,
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'normal', 'high', 'urgent']
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },
    
    group: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "GroupModel"
    }
})
module.exports = mongoose.model('TaskModel', taskSchema);

const TaskModel = require('../models/TaskModel');
const UserModel = require('../models/UserModel');

const addTask = async (req, res) => {
    try {
        console.log('creating a task')

        const task = req.body.task;
        if (!task) {
            return res.status(400).json({ message: 'task data is required'})
        }

        //could be refactored if the client sends the userId then ill'need only to check if the user exists and 
        const user = await UserModel.findOne({username: task.assinedUsername}).populate('group');
        if (!user?.group){
            return res.status(404).json({ message: 'user or group not found'})
        }
        
        //i should be adding a ref to task to save who created the task
        const createdTask = await TaskModel.create({...task, user: user._id ,group: user.group});
        
        res.status(201).json({ message: "task created successfully", task: createdTask })
        console.log('task created')
    } catch (err) {
        res.status(500).json({ msg: "server error", err });
        console.error('Error creating task', err);
    }
}

// to check getAllTasks references
const getTasks = async (req, res) => {
    try {

        console.log('getting all tasks');

        const user = await UserModel.findById(req.user.userId).populate('group')

        if (!user?.group){
            return res.status(404).json({ message: 'user or group not found'})
        }
        const tasksFound = await TaskModel.find( {group: user.group }).populate('user');
        
        console.log(`tasks found`)  
        res.status(200).json( {message: 'tasks found', tasksFound} );      
    } catch(error) {
        console.error('Error fetching tasks', error);
        res.status(500).json({message: 'error', error: error});
    }
}


//todo review  
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body
        console.log('trying to update a task');
        const updatedTask = await TaskModel.findByIdAndUpdate(id, update, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(updatedTask);
        console.log('task updatedk');
    } catch (error) {
        res.status(400).json({ message: 'Error updating task', error });
    }
};

module.exports = {
    addTask,
    getTasks,
    updateTask,
}
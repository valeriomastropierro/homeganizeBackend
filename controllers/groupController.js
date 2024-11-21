const GroupModel = require ('../models/GroupModel');
const UserModel = require('../models/UserModel');


const createGroup = async  (req, res) => {
    try{
        console.log(`creating a group`)
        const groupName = req.body.groupName;
        const userId = req.user.userId;

        if (!groupName) {
            return res.status(400).json({ message: "Group name is required"});
        }

        if (!userId) {
            return res.status(400).json({ message: "UserId error"});
        }

        const user = await UserModel.findById(userId)
        if (user.group){
            return res.status(400).json({ message: "cannot be in two groups simoultaniously "})
        }

        const existingGroup = await GroupModel.findOne({ groupName: groupName});
        if(existingGroup) {
            return res.status(400).json({message: 'group already exists'}); //todo review status code
        }

        const newGroup = new GroupModel ({ groupName, users: [userId] });
        await newGroup.save();

        user.group = newGroup._id;
        await user.save();

        res.status(200).json({message: 'group created successfully', newGroup});
        console.log(`group created successfully name:${newGroup.groupName}`)
    } catch (err){
        console.error("server error", err);
        res.status(500).json({message: 'server error'});
    }
}

const joinGroup = async (req, res) => {
    try {

        const group = await GroupModel.findById(groupId);

        console.log(`userId: ${userId}, group:${group}, groupId: ${groupId} `)

        if(!group) return res.status(404).json({message: 'group not found'});

        if(!group.users.includes(userId)) {
            return res.status(400).json({ message: 'user is already in this group'})
        }

        if (UserModel.group(user)!==null){
            return res.status(400).json({ message: "cannot be in two groups simoultaniously "})
        }

        group.users.push(userId);
        await group.save();
        res.status(200).json({ message: 'User added the group', group})

    } catch (err){
        console.error('server error', err)
        res.status(500).json({ message: 'server error'})
    }
}


//it gives a json {}
const getUsers = async (req,res) => {
    try {

        console.log('getting users...');

        const groupId = await GroupModel.find({users: req.user.userId}, '_id')

        const usersFound = await GroupModel.findById(groupId, 'users').populate('users');

        if (!usersFound){
            return res.status(404).json({message: 'users not found'});
        }
         
        console.log('users sent')
        res.status(200).json({message:'users found', usersFound})

        
    } catch (err) {
        console.error('server error', err);
        res.status(500).json({message: 'server error'})
    }
}

module.exports = {
    createGroup,
    joinGroup,
    getUsers,
}
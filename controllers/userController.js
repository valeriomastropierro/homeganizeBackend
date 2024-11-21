const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const GroupModel = require('../models/GroupModel');
const { error } = require('console'); //WTF is that(?)
const { findByIdAndUpdate } = require('../models/TaskModel');
const secret = process.env.JWT_SECRET || 'your_secret_key';

//-----------------------------------------------------------------------------------------------------------
//AUTHENTICATION and AUTHORIZATION
//signing up only stores the user info (username and crypted password)
//to garant authorization it is used the JWT during login phase. it is removed with logout


const signupUser = async (req, res) => {

    try {
        console.log('signing up user...')

        //validating user inputs
        inputUsername = req.body.username;
        inputPassword = req.body.password;
        if (!inputUsername || !inputPassword) {
            console.log('client did not send username or password');
            return res.status(400).json({ message: 'username and password are required' })
        }

        const isUsernameInUse = await UserModel.exists({ username: inputUsername });
        if (isUsernameInUse) {
            return res.status(400).json({ message: 'username already used' });
        }

        const salt = await bcrypt.genSalt(10);
        const saltedPassword = await bcrypt.hash(inputPassword, salt);
        const createdUser = await UserModel.create({ username: inputUsername, password: saltedPassword });

        console.log(`signup successful for ${req.body.username}`);
        return res.status(201).json({message: 'user signed up successfully'}); 

    } catch (error) {
        console.error('signup error', error);
        res.status(500).json({ message: "server error" })
    }
}


//authorization is given by JWT, which is generated only in this function
//if the client wants authorization, it has to make a login
const loginUser = async (req, res) => {

    try {
        console.log('user logging in...');

        //validating user inputs
        inputUsername = req.body.username;
        inputPassword = req.body.password;
        if (!inputUsername || !inputPassword) {
            console.log('login failed due to username or password not sent')
            return res.status(400).json({ message: 'username and password are required' })
        }

        //checking if there is a user with matching username. also getting the hashed with salt password from the DB to compare later 
        const user = await UserModel.findOne({ username: inputUsername }).select('+password');
        if (!user) {
            console.log('username already used')
            return res.status(401).json('username already used')
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            console.log('the input user password has matched the hashed password from the DB')
            return res.status(401).json('username and password not valid');
        }

        //giving user authorization through JWT
        const accessToken = jwt.sign({ username: user.username, userId: user._id }, secret, { expiresIn: "6000s" });
        res.cookie("authToken", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        })

        res.status(200).json({ message: 'login successful for', username: user.username });
        console.log(`login successful for`)

    } catch (error) {
        console.error('login error', error);
        res.status(500).json({ message: 'server error' })
    }

}

//it clears the JWT. Should be enough to remove the authorization from the client
//have to check if this statement is true...
const logoutUser = (req, res) => {

    try {
        console.log('logging out user...')

        res.clearCookie('authToken');
        res.status(200).json({ message: "Logout successful" })
        console.log('logout success')
    } catch (err) {
        console.error('server error', err);
        res.status(500).json({ message: "error during logout", error: err })
    }
}


//todo=> change getGrout to getUserGroupInfo
//todo => refactor this function and frontend reference
//It is used principally in frontend for the Group Page
const getGroup = async (req, res) => {
    try {
        console.log('getting group info...')

        if (!req.user.userId) {
            return res.status(400).json({ message: 'error in JWT payload' })
        }

        const userAndGroupInfo = await UserModel.findById(req.user.userId).populate('group');
        if (!userAndGroupInfo) {
            return res.status(404).json({ message: 'user or group not found', })
        }

        //telling the client that the user has no group
        if (!userAndGroupInfo.group) {
            return res.status(200).json({ hasGroup: false })//todo check status code
        }

        const groupInfo = await GroupModel.findById(userAndGroupInfo.group._id)
        if (!groupInfo) {
            return res.status(404).json({ message: 'group not found' })
        }

        res.status(200).json({ message: 'group found successfully', groupInfo, hasGroup: true });//todo, verify if hasGroup can be removed and it should be changed to 
        console.log('group info sent successfully')
    } catch (err) {
        console.error('server error', err)
        res.status(500).json({ message: 'server error', error: err });
    }
}


//even though it is not the best practice i make the user join the group through
//the group name. Consequently there cannot be two group with the same group name.
//Improvement can be made if i use another unique short id and use that for joining group
//This should work fine for now. 
const addGroupToUser = async (req, res) => {

    try {
        console.log('adding user to the group...')

        const user = req.user
        const targetGroup = await GroupModel.findOne({ groupName: req.body.groupName });

        if (!user?.userId) {
            return res.status(400).json({ message: 'error in JWT payload' })
        }

        if (!targetGroup) {
            return res.status(404).json({ message: 'group name not found' });
        }

        //check if the user is already in the target group
        isUserInGroup = targetGroup.users.includes(user.userId);
        if (isUserInGroup) {
            return res.status(400).json({ message: "user already in the group" })
        }

        //FIRSTLY: update user, SECONDLY: update group. 
        //To ensure that the info is syncronized i save the updatedUser info
        //and use that to update the group even though it should not be necessary
        const updatedUser = await UserModel.findByIdAndUpdate(user.userId, { group: targetGroup._id }, { new: true });
        targetGroup.users.push(updatedUser._id);
        const newGroup = await targetGroup.save();

        console.log(`added user to the group`);
        res.status(200).json({ message: "user added to the group", newGroup });

    } catch (err) {
        res.status(500).json({ message: "server error", err });
        console.error("error trying to adding user to the group", err);
    }


}


//two steps, firstly updates the user, returning the original document
//then using that document it finds the group and update that
const leaveGroup = async (req, res) => {

    try {
        console.log('leaving group...');

        const userId = req.user.userId;//shouldn't be req.user.userId?
        if (!userId) {
            return res.status(400).json({ message: 'error in user info' });
        }
        
        const userServer = await UserModel.findByIdAndUpdate(userId, { group: null }, { new: false });
        if (!userServer?.group) {
            return res.status(404).json({ message: 'user not found or generic user update error' });
        }

        const groupId = userServer.group
        const groupServer = await GroupModel.findByIdAndUpdate(groupId, {$pull: {users: userId}}, {new: true})
        if(!groupServer){
            return res.status(404).json({ message: 'group not found or generic group update error' });
        }
        res.status(200).json({ message: 'Left group successfully' });
        console.log('user left group');
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
        console.error('Server error', err);
    }
};

//cannot be removed. Should refactor. It is used by taskCard and maybe something else
const getUsernameById = async (req, res) => {
    try {
        console.log('getting user username');
        const username = await UserModel.findOne(req.body.userId).select(username)
        res.status(200).json({ message: 'user info sent correctly', username: username })
    } catch (err) {
        console.error('server error', err);
        res.status(500).json({ message: 'server error', err })
    }
}


module.exports = {
    signupUser,
    loginUser,
    logoutUser,
    addGroupToUser,
    leaveGroup,
    getGroup,
    getUsernameById,
}
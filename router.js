const express = require('express');
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const groupController = require('./controllers/groupController');
const chatController = require('./controllers/chatController.js')
const authenticateToken = require('./middleware/auth');

const router = express.Router();

//it is used by frontend, specifically App for verification purpose. Could be refactored
router.get('/auth/verify', authenticateToken, (req, res) => { res.status(200).json({ message: 'verification success' }) })

//user authentications
router.post('/signup', userController.signupUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);

//tasks
router.get('/tasks', authenticateToken, taskController.getTasks);
router.post('/tasks', authenticateToken, taskController.addTask);
router.patch('/tasks/:id', authenticateToken, taskController.updateTask);

//group
router.post('/group', authenticateToken, groupController.createGroup);
router.get('/group/users', authenticateToken, groupController.getUsers)

//user
router.get('/usernameById', authenticateToken, userController.getUsernameById)
router.patch('/user/addGroupToUser', authenticateToken, userController.addGroupToUser)
router.get('/group', authenticateToken, userController.getGroup)
router.patch('/group/leave', authenticateToken, userController.leaveGroup);
router.get('/me', authenticateToken, (req, res) => {
    res.json({ username: req.user.username })
})

//chat
router.post('/save-message', authenticateToken, chatController.saveMessage);
router.get('/get-messages/:groupId', authenticateToken, chatController.getMessages);

module.exports = router
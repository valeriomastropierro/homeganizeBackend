const ChatModel = require('../models/ChatModel');

const saveMessage = async (req, res) => {
    const { groupId, messageText } = req.body;

    const { username, userId } = req.user;


    try {
        const newMessage = await ChatModel.create({
            groupId: groupId,
            message: messageText,
            timestamp: new Date().toISOString(),
            username,
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error saving message', err);
        res.status(500).json({ message: 'Error saving message' });
    }
}

const getMessages = async (req, res) => {
    const { groupId } = req.params;
    const { username, userId } = req.user;

    try {
        const messages = await ChatModel.find({ groupId }).sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching messages', err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
}

module.exports = {
    saveMessage,
    getMessages,
}

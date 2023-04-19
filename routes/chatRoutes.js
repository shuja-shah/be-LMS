const express = require('express');
const router = express.Router();
const Chat = require('../models/conversation');
const Message = require('../models/message');
const { authCheck } = require("../middlewares/_auth");

// Get all chats
router.get('/chats', authCheck, async (req, res) => {
    try {
        const chats = await Chat.find();
        res.send(chats);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get a specific chat by its id
router.get('/chats/:id', authCheck, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id).populate({
            path: 'messages',
            populate: { path: 'sender' } // populate the sender field in each message
        });
        res.send(chat);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Create a new chat
router.post('/chats', authCheck, async (req, res) => {
    try {
        const { name, participants } = req.body;
        if (!participants.length) {
            return res.status(400).send({ error: 'Please add at least one participant.' });
        }
        const createdBy = req.user._id;
        const existingParticipants = await Chat.find({ participants: { $in: participants } });
        if (existingParticipants.length > 0) {
            return res.status(400).send({ error: 'One or more participants already exist in another Channel.' });
        }
        const newChat = new Chat({ name, participants, createdBy });
        const savedChat = await newChat.save();
        res.send(savedChat);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/chats/:id', authCheck, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).send({ error: 'Chat not found' });
        }

        await Chat.deleteOne({ _id: chat._id });
        res.send({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// Add a new message to a chat by its id
// router.post('/chats/:id/messages', authCheck, async (req, res) => {
//     try {
//         const { text } = req.body;
//         const chatId = req.params.id;
//         const sender = req.user._id;
//         const newMessage = new Message({ text, chatId, sender });
//         const savedMessage = await newMessage.save();
//         res.send(savedMessage);
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });



router.post('/chats/:id/messages', authCheck, async (req, res) => {
    try {
        const { text } = req.body;
        const chatId = req.params.id;
        const sender = req.user._id;

        // Create a new message and save it to the database
        const newMessage = new Message({ text, sender });
        const savedMessage = await newMessage.save();

        // Find the conversation with the given ID and add the new message to its messages array
        const conversation = await Chat.findById(chatId);
        conversation.messages.push(savedMessage._id);

        // Save the updated conversation to the database
        const savedConversation = await conversation.save();

        // Return the saved message in the response
        res.send(savedMessage);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all messages sent in all chats (admin only)
router.get('/messages', authCheck, async (req, res) => {
    try {
        const messages = await Message.find().populate('chatId');
        res.send(messages);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;

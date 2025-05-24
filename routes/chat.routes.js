const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.post("/stream-chat", chatController.streamChat);

module.exports = router;

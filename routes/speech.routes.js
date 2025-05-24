const express = require("express");
const router = express.Router();
const { recognizeWav } = require("../controllers/speech.controller");

// 语音识别接口
router.post("/recognize", recognizeWav);

module.exports = router;

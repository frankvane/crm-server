const express = require("express");
const router = express.Router();
const ffmpegController = require("../controllers/ffmpeg.controller");

// FFmpeg 文件转换路由
router.post("/ffmpeg-convert", ffmpegController.convertFile);

module.exports = router;

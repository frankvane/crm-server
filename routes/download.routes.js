const express = require("express");
const downloadController = require("../controllers/download.controller");
const router = express.Router();

// 获取文件列表
router.get("/file/list", downloadController.getFileList);

// 下载文件
router.get("/file/download/:file_id", downloadController.downloadFile);

module.exports = router;

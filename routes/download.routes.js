const express = require("express");
const downloadController = require("../controllers/download.controller");
const router = express.Router();

// 获取文件列表
router.get("/file/list", downloadController.getFileList);

// 获取文件详细信息
router.get("/file/info/:file_id", downloadController.getFileInfo);

// 下载文件
router.get("/file/download/:file_id", downloadController.downloadFile);

// 下载文件分片
router.get(
  "/file/download/:file_id/chunk/:index",
  downloadController.downloadChunk
);

// 获取文件下载信息（支持断点续传）
router.get("/file/download/:file_id/info", downloadController.getDownloadInfo);

module.exports = router;

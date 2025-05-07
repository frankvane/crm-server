const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 临时分片存储目录
const tmpDir = path.join(__dirname, "../tmp/upload");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const { file_id, index } = req.body;
    cb(null, `${file_id}_${index}`);
  },
});
const upload = multer({ storage });

// 秒传确认
router.post("/file/instant", fileController.instantCheck);
// 状态查询
router.get("/file/status", fileController.statusQuery);
// 分片上传
router.post("/file/upload", upload.single("chunk"), fileController.uploadChunk);
// 分片合并
router.post("/file/merge", fileController.mergeChunks);

module.exports = router;

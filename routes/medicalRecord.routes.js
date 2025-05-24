const express = require("express");
const router = express.Router();
const medicalRecordController = require("../controllers/medicalRecord.controller");


// 创建病例
router.post("/", medicalRecordController.create);
// 获取病例列表
router.get("/", medicalRecordController.list);
// 获取单个病例
router.get("/:id", medicalRecordController.findOne);
// 更新病例
router.put("/:id", medicalRecordController.update);
// 删除病例
router.delete("/:id", medicalRecordController.delete);
// 批量删除病例
router.post("/deleteMany", medicalRecordController.deleteMany);
module.exports = router; 
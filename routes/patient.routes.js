const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");

// 创建病患
router.post("/", patientController.create);
// 获取病患列表
router.get("/", patientController.list);
// 获取单个病患
router.get("/:id", patientController.findOne);
// 更新病患
router.put("/:id", patientController.update);
// 删除病患
router.delete("/:id", patientController.delete);
// 批量删除病患
router.post("/deleteMany", patientController.deleteMany);

module.exports = router; 
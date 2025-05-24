const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// 创建产品
router.post("/", productController.create);
// 获取产品列表
router.get("/", productController.list);
// 获取单个产品
router.get("/:id", productController.findOne);
// 更新产品
router.put("/:id", productController.update);
// 删除产品
router.delete("/:id", productController.delete);
// 批量删除产品
router.post("/deleteMany", productController.deleteMany);

module.exports = router;

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const auth = require("../middlewares/auth");

router.post("/", auth, categoryController.create);
router.get("/", auth, categoryController.list);

module.exports = router;

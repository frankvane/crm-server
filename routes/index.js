const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/categories", require("./category.routes"));
router.use("/category-types", require("./categoryType.routes"));
router.use("/roles", require("./role.routes"));

module.exports = router;

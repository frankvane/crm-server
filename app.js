require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");
const { sequelize } = require("./models");

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

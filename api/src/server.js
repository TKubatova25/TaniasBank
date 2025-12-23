require("dotenv").config(); // loads .env into process.env

const { app } = require("./app");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`TaniasBank API running on http://localhost:${PORT}`);
});
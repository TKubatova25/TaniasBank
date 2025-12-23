const { app } = require("./app");

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`TaniasBank API running on http://localhost:${PORT}`);
});
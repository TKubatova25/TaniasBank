//This resets the DB before the test suite runs, guaranteeing a clean state.
const { execSync } = require("child_process");
const path = require("path");

module.exports = async () => {
  const repoRoot = path.resolve(__dirname, ".."); // e2e/.. => project root

  execSync(
    'docker compose exec -T db psql -U tania -d taniasbank < api/sql/reset_db.sql',
    { stdio: "inherit", cwd: repoRoot }
  );
};
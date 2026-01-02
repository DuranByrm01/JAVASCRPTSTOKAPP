


require("dotenv").config();

const config = {
  db: {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
  }
};

console.log("DB config canlıda:");

module.exports = config;


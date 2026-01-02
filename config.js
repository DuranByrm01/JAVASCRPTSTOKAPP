// const config = {
//     db: {
//         host: "localhost",
//         user: "root",
//         password:"bayram22",
//         database:"stockapp"
//     }

// }



// const config = {
//   db: {
//     host: "mysql.railway.internal",
//     user: "root",
//     password: "krXAOdGGShBPwlZWITYAsSTMJMJKkQGl",
//     database: "railway",
//     port: 3306
//   }
// };


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

console.log("DB config canlıda:", config.db);

module.exports = config;


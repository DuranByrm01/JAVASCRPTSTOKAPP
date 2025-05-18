// const config = {
//     db: {
//         host: "localhost",
//         user: "root",
//         password:"bayram22",
//         database:"stockapp"
//     }

// }


// require("dotenv").config(); // .env dosyasını oku

// const config = {
//     db: {
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//         port: process.env.DB_PORT || 3306 // default olarak 3306
//     }
// };

// module.exports = config;



// require("dotenv").config();

// const config = {
//   db: {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: Number(process.env.DB_PORT) || 3306,
//   }
// };

// console.log("DB config canlıda:", config.db);

// module.exports = config;


// require("dotenv").config();

// const config = {
//   db: {
//     host: process.env.MYSQLHOST,
//     user: process.env.MYSQLUSER,
//     password: process.env.MYSQLPASSWORD,
//     database: process.env.MYSQLDATABASE,
//     port: Number(process.env.MYSQLPORT) || 3306
//   }
// };

// console.log("DB config canlıda:", config.db);

// module.exports = config;


const config = {
  db: {
    host: "mysql.railway.internal",
    user: "root",
    password: "krXAOdGGShBPwlZWITYAsSTMJMJKkQGl",
    database: "railway",
    port: 3306
  }
};

console.log("DB config canlıda:", config.db);

module.exports = config;


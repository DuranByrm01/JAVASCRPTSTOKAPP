const mysql = require("mysql2");
const config = require("../config");

let connection = mysql.createConnection(config.db);

connection.connect(function (err) {
  if (err) {
    return console.log(err);
  }


  console.log("mysql bağlantısı başarılı...")
});

module.exports = connection.promise();



// const mysql = require("mysql2/promise"); // promise destekli mysql2

// const config = require("../config");

// const pool = mysql.createPool({
//   host: config.db.host,
//   user: config.db.user,
//   password: config.db.password,
//   database: config.db.database,
//   port: config.db.port || 3306,
//   waitForConnections: true,
//   connectionLimit: 10, // istediğin kadar bağlanma limiti koyabilirsin
//   queueLimit: 0
// });

// module.exports = pool;

// const config = {
//     db: {
//         host: "localhost",
//         user: "root",
//         password:"bayram22",
//         database:"stockapp"
//     }

// }


require("dotenv").config(); // .env dosyasını oku

const config = {
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306 // default olarak 3306
    }
};

module.exports = config;



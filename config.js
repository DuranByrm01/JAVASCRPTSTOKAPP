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
        database: process.env.DB_NAME
    }
};

module.exports = config;



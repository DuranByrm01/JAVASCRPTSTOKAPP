// const express = require("express");

// const app = express();

// app.set("view engine", "ejs");


// app.use(express.urlencoded({extended: true}));
// app.use(express.json());

// const userRoutes = require("./routes/users");
// const adminRoutes = require("./routes/admin");
// const get_post = require("./routes/get_post");


// app.use(express.static('public'));

// app.use(express.static("node_modules"));

// app.use("/admin",adminRoutes);
// app.use(userRoutes);
// app.use(get_post);




// app.listen(3000,function(){
//     console.log("port 3000 çalışıyor");
    
// });


// const express = require("express");
// const app = express();

// app.set("view engine", "ejs");

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// const userRoutes = require("./routes/users");
// const adminRoutes = require("./routes/admin");
// const get_post = require("./routes/get_post");

// app.use(express.static("public"));
// app.use(express.static("node_modules"));

// app.use("/admin", adminRoutes);
// app.use(userRoutes);
// app.use(get_post);

// // ✅ PORT ayarını Railway'e uygun hale getir
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, function () {
//     console.log(`Uygulama çalışıyor: http://localhost:${PORT}`);
// });

require("dotenv").config(); // Bu EN ÜSTTE olacak

const config = require("./config");

console.log("process.env.MYSQLHOST:", process.env.MYSQLHOST);


const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const get_post = require("./routes/get_post");

app.use(express.static("public"));
app.use(express.static("node_modules"));

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(get_post);

// 👇 BUNU EKLEDİN
app.get('/', (req, res) => {
    res.render("users/login");  // views/users/login.ejs dosyasını render eder
});

const cronReportRoute = require("./routes/cronReport");
app.use("/", cronReportRoute); // ana dizine ekleniyor


// ✅ PORT ayarını Railway'e uygun hale getir
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Uygulama çalışıyor: http://localhost:${PORT}`);
});

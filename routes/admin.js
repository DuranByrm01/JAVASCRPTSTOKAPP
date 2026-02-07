const express = require("express");
const router = express.Router();

const db = require("../data/db");

const data = {
    title: "Homepage",

}

router.get("/save", function (req, res) {
    try {

        res.render("admin/save", {
            title: "STOCK APP"
        });
    } catch (error) {
        console.log(error);
    }
});

router.use("/gunlukList", function (req, res) {

    res.render("admin/gunlukList", {
        title: "STOCK APP"

    });
});

router.use("/sertifika", function (req, res) {

    res.render("admin/sertifika", {
        title: "SERTİFiKA APP"

    });
});



module.exports = router;
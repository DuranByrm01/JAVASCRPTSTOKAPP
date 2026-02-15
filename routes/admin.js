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

router.get("/gunlukList", function (req, res) {

    res.render("admin/gunlukList", {
        title: "STOCK APP"

    });
});



router.get("/certificate", function (req, res) {
    try {

        res.render("admin/certificate", {
            title: "İNKATECH CERTİFİCATE APP"
        });
    } catch (error) {
        console.log("sertifika sayfası hatası", error);
    }
});




module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

const data = {
    title : "Homepage",
    
}

router.get("/save",function(req, res){
   try {
       
       res.render("admin/save", {
           title:"STOK SAYFAM"
       });
   } catch (error) {
        console.log(error);
   }
});

router.use("/gunlukList",function(req, res){
    
    res.render("admin/gunlukList", {
        title:"MY STOCK"
        
    });
});



module.exports = router;
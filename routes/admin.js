const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

const data = {
    title : "Homepage",
    
}

router.get("/save",function(req, res){
   try {
       
       res.render("admin/save", {
           title:"STOK UYGULAMAM"
       });
   } catch (error) {
        console.log(error);
   }
});

router.use("/gunlukList",function(req, res){
    
    res.render("admin/gunlukList", {
        title:"STOK UYGULAMAM"
        
    });
});



module.exports = router;
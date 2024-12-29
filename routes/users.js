const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

const data = {
    title : "Homepage",
    cards:" rows"
}

router.get("/deneme",async  function(req, res){

    try {
       
        
        res.render("users/deneme",{
            title: "DENEME",
            
        });
        
    } catch (error) {
        console.log(error);
    }
    
    
});

router.get("/gunlukUretim",async  function(req, res){

    try {
        const [saveDayData, ] = await db.execute("select * from savedata")
        
        res.render("users/gunlukUretim",{
            title:"STOK SAYFAM",
            daySaveData : saveDayData
        });
        
    } catch (error) {
        console.log(error);
    }


});

router.use("/urunKayit",function(req, res){
   
    res.render("users/urunKayit",{
        title:"STOK SAYFAM"
        
    });
});

router.use("/urunList", async function(req, res){
    

    try {
        const [urunListC, ] = await db.execute("select * from urunler")
        const [trc60] = await db.execute("SELECT * FROM trc60");
        

        res.render("users/urunList", {

            title:"STOK SAYFAM",
            cards: urunListC,
            trcStockCard : trc60
            
        });
        
    } catch (err) {
       console.log(err); 
    }

   
    
});

router.get("/index",async function(req, res){

    try{
      
        const [stokCard] = await db.execute("SELECT * FROM urunler");
     
        res.render("users/index", {
            title:"STOK SAYFAM",
            urunName: stokCard,
            
            
        });
    }
    catch(err){
        console.log(err);
    }

   
});




router.get("/savedata", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM savedata");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Veritabanı hatası");
    }
});




// router.get("/urun/card", async function (req, res) {
    
//     try {

//         const [trc60] = await db.execute("SELECT * FROM trc60");
//         res.json(trc60);

        
//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Veritabanı hatası");
//     }



// })

// router.get('/urun/card/trc01', async function (req, res) {
    
//     try {

//         const [trc01] = await db.execute("SELECT * FROM trc01");
//         res.json(trc01);

        
//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Veritabanı hatası");
//     }



// })






module.exports = router;
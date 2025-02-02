const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

const data = {
    title : "Homepage",
    cards:" rows"
}

router.get("/trc60-production",async  function(req, res){

    try {
       
        
        res.render("users/trc60-production",{
            title: "ANASAYFA",
            
        });
        
    } catch (error) {
        console.log(error);
    }
    
    
});

router.get("/deneme",async  function(req, res){

    try {
       
        
        res.render("users/deneme",{
            title: "CANLI STOK",
            
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

router.use("/urunKayit", async function(req, res){

    res.render("users/urunKayit",{
        title:"STOK SAYFAM",
        
    });
    
});

router.use("/urunList", async function(req, res){
    

    try {
        const [urunListC, ] = await db.execute("select * from urunler")
        
        const [trc60Ürünler, ] = await db.execute("SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_PK = 1001;")

        const [trc01Ürünler, ] = await db.execute("SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_PK = 1002;")

        const [luvinkaÜrünler, ] = await db.execute("SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_PK = 1006;")

        const [gzc24Ürünler, ] = await db.execute("SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_PK = 1003;")

        const [goldÜrünler, ] = await db.execute("SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_PK = 1004;")

        const [casusÜrünler, ] = await db.execute("SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_PK = 1005;")

        res.render("users/urunList", {

            title:"STOK SAYFAM",
            cards: urunListC,
            trc60StockCard : trc60Ürünler,
            trc01StockCard : trc01Ürünler,
            gzc24StockCard : gzc24Ürünler,
            goldStockCard : goldÜrünler,
            casusStockCard : casusÜrünler,
            luvinkaStockCard : luvinkaÜrünler,
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










module.exports = router;
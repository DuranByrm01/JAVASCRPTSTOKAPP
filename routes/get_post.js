const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

router.get('/siparisList/trc60', async function (req, res) {
    
    try {
        
        const [trc60] = await db.execute("SELECT * FROM trc60");
        res.json(trc60);

        

        
    } catch (error) {
        console.log(error);
        res.status(500).send("Veritabanı hatası");
    }



})

router.get('/lowStock/get', async function (req, res) {

    try {
        const [lowStock] = await db.execute(
          "SELECT urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_adet < 1000 ORDER BY urun_malzeme_adet ASC;"
        );
        res.json(lowStock);  // Malzeme miktarı 1000'in altında olan tüm kayıtları gönder
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

router.get('/urunler/get', async function (req, res) {

    try {
        const [urnList] = await db.execute( "SELECT urun_key, urun_Name FROM urunler;");

        res.json(urnList); 
        
    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

router.get('/urunler/malzeme/get/:urun_malzeme_PK', async function (req, res) {

    try {
        const [urunMalzeme] = await db.execute("SELECT * FROM urunmalzemeleri WHERE urun_malzeme_PK = ?", [req.params.urun_malzeme_PK]);

        res.json(urunMalzeme); 
        
    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});



////////////////////////////////////////////////////////////////////////////////////////////////


  


  
  

//////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;
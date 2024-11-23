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

router.post('/urunler/stok/post', async (req, res) => {
    const { product, material, amount } = req.body;
  
    console.log("Gönderilen Veriler:", req.body);
    
     // `material` içinden ID'yi çek (örneğin: "TRC01 PCB (12)" -> ID: 12)
     const materialIdMatch = material.match(/\((\d+)\)/); // Parantez içindeki sayıyı yakala
     const materialId = materialIdMatch ? parseInt(materialIdMatch[1], 10) : null;
    
     // Veritabanında malzemeyi bul
    const [rows] = await db.query("SELECT urun_malzeme_adet FROM urunmalzemeleri WHERE malzeme_id = ?", [materialId]);

    const currentStock = rows[0].stok; // Mevcut stok miktarı
    const newStock =
      action === "add" ? currentStock + parseInt(amount, 10) : currentStock - parseInt(amount, 10);


    // Stok miktarını güncelle
    await db.query("UPDATE urunmalzemeleri SET urun_malzeme_adet = ? WHERE malzeme_id = ?", [newStock, materialId]);

    res.status(200).json({
        success: true,
        message: "Stok başarıyla güncellendi.",
        updatedStock: newStock,
      });

    
});
  
  




  
  

//////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;
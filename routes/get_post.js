const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

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

router.get('/siparisList/trc60', async function (req, res) {
    
    try {
        
        const [trc60] = await db.execute("SELECT * FROM trc60");
        res.json(trc60);

        

        
    } catch (error) {
        console.log(error);
        res.status(500).send("Veritabanı hatası");
    }



})

router.post("/gunlukUretim", async function(req,res){
    const urunName =  req.body.urunName;
    const urunDetay =  req.body.urunDetay;
    const urunAdet =  req.body.urunAdet;
    const urunDate =  req.body.urunDate;
     
    try{
         await db.execute("INSERT INTO savedata(urunName,urunDetay,urunAdet,urunDate) VALUES (?,?,?,?)", [urunName, urunDetay, urunAdet, urunDate])
         res.redirect("/gunlukUretim");
    }
    catch(err){
         console.log(err);
    }
 
 });


 router.post("/urunler/post", async function(req,res){
    const malName =  req.body.malName;
    const malAltName =  req.body.malAltName;
    const urunAdet =  req.body.amount;
    const urunACTİON =  req.body.urunACTİON;
     
    try{
        console.log("post edilen veriler",malName,malAltName,urunAdet,urunACTİON)
         res.redirect("/urunKayit");
    }
    catch(err){
         console.log(err);
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
    
      // Mevcut stok bilgisini al
      const [rows] = await db.query(
        "SELECT urun_malzeme_adet FROM urunmalzemeleri WHERE urun_malzeme_adi = ? AND malzeme_id = ?",
        [product, material]
    );

    if (rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Belirtilen ürün malzemesi bulunamadı.",
        });
    }

    const currentStock = rows[0].urun_malzeme_adet;

    // Yeni stok miktarını hesapla
    const newStock = currentStock + parseInt(amount);
    
    // Stok miktarını güncelle
    await db.query(
        "UPDATE urunmalzemeleri SET urun_malzeme_adet = ? WHERE urun_malzeme_adi = ? AND malzeme_id = ?",
        [newStock, product, material]
    );
    
    
});
  
  




  
  

//////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;
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






/////////////////////////////////////////////////////////////////////////////////////////////////dasdad/////////////


router.post('/urunler/stok/post', async (req, res) => {
    const { product, material, amount, action } = req.body;

    console.log("Gönderilen Veriler:", req.body);
    
    try {
        // Eğer amount boşsa, işlem yapılmasın
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).send('Miktar geçerli olmalıdır.');
        }

        const [productResult] = await db.execute(
            'SELECT * FROM urunler WHERE urun_Name = ?',
            [product]
        );

        // console.log("çıktı alınan Malzeme", productResult);

        if (productResult.length === 0) {
            return res.status(404).send('Ürün bulunamadı.');
        }

        let material = req.body.material;  // material değerini al
        material = material.trim().toLowerCase();  // material değerini temizle ve küçük harfe çevir
        const productKey = productResult[0].urun_key;  // ürün key'ini al

        // 2. Malzemeyi bul
        const [materialResult] = await db.execute(
            'SELECT * FROM urunmalzemeleri WHERE urun_malzeme_adi = ? AND urun_key = ?',
            [material, productKey]
        );

        // console.log("malzeme çıktısı", materialResult);  

        if (materialResult.length === 0) {
            return res.status(404).send('Malzeme bulunamadı.');
        }

        // Mevcut malzeme miktarını al
        const currentAmount = materialResult[0].urun_malzeme_adet;

        // amount'ı sayıya dönüştür
        const amountToUpdate = parseInt(amount, 10);

        // action'a göre yeni miktarı hesapla
        let newAmount;

        if (action === 'add') {
            // Eğer işlem 'add' ise, miktarı ekle
            newAmount = currentAmount + amountToUpdate;
        } else if (action === 'remove') {
            // Eğer işlem 'remove' ise, miktarı çıkar
            // Stok miktarı negatif olmamalı, bu yüzden kontrol edelim
            if (currentAmount < amountToUpdate) {
                console.log("return a gelik");
                return res.status(400).send('Yeterli stok yok!');
                
            }else{
                newAmount = currentAmount - amountToUpdate;
            }
            
        }

        // Malzeme miktarını güncelle
        await db.execute(
            'UPDATE urunmalzemeleri SET urun_malzeme_adet = ? WHERE urun_malzeme_adi = ? AND urun_key = ?',
            [newAmount, material, productKey]
        );

        if(action === "add"){
            console.log(`Ürün adı ${product} malzeme adı ${material} eklenen malzeme miktarı: ${amount} GÜNCEL ADET : ${newAmount} `);
        }else{
            console.log(`Ürün adı ${product} malzeme adı ${material} çıkarılan malzeme miktarı: ${amount} GÜNCEL ADET : ${newAmount} `);
        }

        
        // loglama 
        
        await db.execute(`INSERT INTO urun_malzeme_kayıtları (urun_adi, malzeme_adi, amount, action) VALUES (?,?,?,?)`, [product,material,amount,action]);
        
        ///////
        
        // Yönlendirme işlemini en son yapıyoruz
        res.redirect('/index');

    } catch (error) {
        console.log(error);
        return res.status(500).send('Bir hata oluştu.');
    }
});


//////////////////////log

router.get('/add/remove/log', async function (req, res) {

    try {
        const [loglama] = await db.execute(`SELECT * FROM urun_malzeme_kayıtları`);
        // res.json(loglama);
        // res.render('add/remove/log',{loglama});
        console.log(loglama);

        res.render("add/remove/log", {
            title: "STOK SAYFAM",
            addRemoveLog: loglama,
        });

        console.log(addRemoveLog);

    } catch (error) {
        console.log("add/remove", error);
    }

    
});
  


//////////////////////////////////////////////////////////////////////////////////////////////////////

/////////üretim sayısı ///////////////////////////////////////

router.get('/urunler/uretimSayisi/get', async function (req, res) {

    try {
        const [trc60UretimSayisi] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1001' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        );
        
        
        res.json(trc60UretimSayisi);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

///////

router.get('/urunler/uretimSayiTrc01/get', async function (req, res) {

    try {
        const [trc01UretimSayisi] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1002' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        );
        
        
        res.json(trc01UretimSayisi);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

/////////////

router.get('/urunler/uretimSayiGZC24/get', async function (req, res) {

    try {
        const [uretimSayiGZC24] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1003' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        );
        
        
        res.json(uretimSayiGZC24);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

///////////////

router.get('/urunler/uretimSayiGZC24Gold/get', async function (req, res) {

    try {
        const [uretimSayiGZC24Gold] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1004' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        );
        
        
        res.json(uretimSayiGZC24Gold);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

router.get('/urunler/uretimSayiCasus/get', async function (req, res) {

    try {
        const [uretimSayiGZC24Gold] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1005' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        );
        
        
        res.json(uretimSayiGZC24Gold);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});


//////üretim sayısı///////////////////////////////////


////////malzeme ekleme //////////////////////


router.post('/urun/malzeme', async (req, res) =>{

    const { urunAdi, urunAdet, urunPK, urunKey, urunsavedate } = req.body;

    // aynı üründen varsa ekleme diye kod yazılacak 
    console.log(urunsavedate);

    try {
        await db.execute("INSERT INTO urunmalzemeleri(urun_malzeme_adi,urun_malzeme_adet,urun_malzeme_PK,urun_key) VALUES (?,?,?,?)", [urunAdi,urunAdet,urunPK,urunKey])
        res.redirect("/urunKayit");
    } catch (error) {
        console.log(error);
    }


});



////////malzeme ekleme //////////////////////

//////////////ürün kartları /////////////////////////

router.get('/urun/card', async function (req, res){

    try {

        const [urunListCard ] = await db.execute ( "SELECT * FROM urunler" );

        res.json(urunListCard);

    

    } catch (error) {

        console.log(error);

        res.status(500).send("veri tabanı hatası");

    }



});



//////////////ürün kartları /////////////////////////

module.exports = router;
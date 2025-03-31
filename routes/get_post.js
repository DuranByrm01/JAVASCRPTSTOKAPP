const express = require("express");
const router = express.Router();

const db = require("../data/db"); 

router.get('/lowStock/get', async function (req, res) {

    try {

        // Önce 1000'in üzerinde olanların checked değerini sıfırla
        await db.execute(
            "UPDATE urunmalzemeleri SET checked = 0 WHERE urun_malzeme_adet >= 1000"
        );

        const [lowStock] = await db.execute(
          "SELECT urun_malzeme_adi, urun_malzeme_adet , malzeme_id , checked FROM urunmalzemeleri WHERE urun_malzeme_adet < 1000 ORDER BY urun_malzeme_adet ASC;"
        );
        res.json(lowStock);  // Malzeme miktarı 1000'in altında olan tüm kayıtları gönder
    } catch (error) {
        console.error("lowStock hatası",error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

router.post('/lowStock/update', async function (req, res) {
    const { malzeme_id, checked } = req.body;

    

    // Gelen veriyi kontrol et
    if (!malzeme_id || typeof checked === "undefined") {
        return res.status(400).json({ success: false, message: "Eksik parametreler" });
    }

    try {
        const [result] = await db.execute(
            "UPDATE urunmalzemeleri SET checked = ? WHERE malzeme_id = ?",
            [checked ? 1 : 0, malzeme_id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Güncelleme başarılı" });
        } else {
            res.status(404).json({ success: false, message: "Malzeme bulunamadı" });
        }
    } catch (error) {
        console.error("Update hatası:", error);
        res.status(500).json({ success: false, message: "Veritabanı hatası" });
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
         console.log("günlük üretim hatası",err);
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






/////////////////////////////////////////////////////////////////////////////////////////////////dasdad/////////////ekle çıkar


router.post('/urunler/stok/post', async (req, res) => {
    const { product, material, amount, action , date } = req.body;

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

        if (action === 'GİRDİ') {
            // Eğer işlem 'add' ise, miktarı ekle
            newAmount = currentAmount + amountToUpdate;
        } else if (action === 'ÇIKTI') {
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

        if(action === "GİRDİ"){

            addMesage = (`Ürün adı ${product} malzeme adı ${material} eklenen malzeme miktarı: ${amount} GÜNCEL ADET : ${newAmount} `);

            console.log(addMesage);

            
        }else{

            removeMesage = (`Ürün adı ${product} malzeme adı ${material} çıkarılan malzeme miktarı: ${amount} GÜNCEL ADET : ${newAmount} `);

            console.log(removeMesage);
            
        }

        
        // loglama 
        
        await db.execute(`INSERT INTO urun_malzeme_kayıtları (urun_adi, malzeme_adi, amount, action, date) VALUES (?,?,?,?,?)`, [product,material,amount,action,date]);
        
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


////////malzeme ekleme save page //////////////////////


router.post('/urun/malzeme', async (req, res) =>{

    const { urunAdi, urunAdet, urunPK, urunKey, } = req.body;

    // aynı üründen varsa ekleme diye kod yazılacak 
    

    try {
        await db.execute("INSERT INTO urunmalzemeleri(urun_malzeme_adi,urun_malzeme_adet,urun_malzeme_PK,urun_key) VALUES (?,?,?,?)", [urunAdi,urunAdet,urunPK,urunKey])
        res.redirect("/urunKayit");
    } catch (error) {
        console.log(error);
    }


});



////////malzeme ekleme //////////////////////

//////////////ürün kartları /////////////////////////



//////////////ürün kartları /////////////////////////
/////////////////////////////////////////////////////////////loglama

router.get('/add/Remove', async function (req, res) {

    try {

        const [addRemove, ] = await db.execute("select * from urun_malzeme_kayıtları")

        res.json(addRemove);

    } catch (error) {
        console.log("backend add/remove hatası :",error);
    }
    

    
})


///////////////////////////////////////////////////////////
///////////trc60 barkod kayıt ///////////////////////

router.post("/barkod/data/save", async (req, res) => {
    const { barkod , barkodDateSave } = req.body;

    

    try {

        //ürünmalzemeleri tablosundan trc60 ın alt mazlemeleri çek
        const [trc60urunMalzemeStok] = await db.execute("SELECT urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = 1001");

        const [midiBoxTrc60100Fınd] = await db.execute("SELECT TRC60_20PCS_BOX_LIST_BARKOD FROM trc60_20pcs_box_lıst WHERE TRC60_20PCS_BOX_LIST_BARKOD = ? ", [barkod]);

        if(midiBoxTrc60100Fınd.length > 0){
            // return res.json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });
            // return console.log("bu barkod zaten daha önceden eklenmiş");
            return res.status(409).json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });

        }

        //eğer stok 20 den az ise hata ver
        if(trc60urunMalzemeStok.length === 0 || trc60urunMalzemeStok[0].urun_malzeme_adet < 20){
            console.log("TRC60 ALT MALZEMELERİNDE STOK YETERSİZ");
            // return res.json({ message: "TRC60 ALT MALZEMELERİNDE STOK YETERSİZ!" });
            return res.status(400).json({ success: false, message: "TRC60 ALT MALZEMELERİNDE STOK YETERSİZ!" });
        }

        // barkod ekle

        await db.execute("INSERT INTO trc60_20pcs_box (trc60_20pcs_box_barkod, trc60_20pcs_box_date) VALUES (?,?)", [barkod, barkodDateSave])
        res.status(200).json({ message: "Barkod başarıyla kaydedildi!", barkod, barkodDateSave });
        // res.status(200).send();

        //stok yeterliyse 20 azalt 

        await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - 20 WHERE urun_key = 1001");
       
        
    } catch (error) {
        
        console.log("Barkod 20 pcs kayıt hatası:", error);
        res.status(500).json({ message: "Veri eklenirken hata oluştu!" });
    }


})


router.get("/barkod/data/save/get", async function (req, res) {

    try {
        
        const [barkod20pcs,] = await db.execute("SELECT id_20_pcs, trc60_20pcs_box_barkod , trc60_20pcs_box_date FROM trc60_20pcs_box");

        res.json(barkod20pcs);

        

       


    } catch (error) {

        console.log("barkod data save hatası", error);
        res.status(500).json({ message: "Veri getirme hatası!" });

    }

    


});


router.get("/barkod/data/save/get/box/number", async function (req,res) {
    
   try {

        const [trc6020pcskutuAdet] = await db.execute ("SELECT trc60_20pcs_box_barkod FROM trc60_20pcs_box");


        res.json(trc6020pcskutuAdet)

   } catch (error) {
        console.log("number box", error);
   }


})


////////////////////////////////////////////////////

///////////trc60/////////20////list/////


    router.get("/trc60/20/box/barkod", async function (req, res) {

        try {

            const [trc60Box20pcsListİtem ] = await db.execute("SELECT id, TRC60_20PCS_BOX_LIST_BARKOD, TRC60_20PCS_BOX_LIST_date FROM trc60_20pcs_box_lıst");

            res.json(trc60Box20pcsListİtem);

            
        } catch (error) {
            console.log("trc60 20lik liste hatası", error);
        }
        
    });





/////////////////////////////////////////////

////////////trc60///////guncel/////stok/////

router.get("/trc60/guncel/stok/trc6020pcs", async function (req, res) {
    
    try {

        const [trc60guncelStock] = await db.execute ("SELECT  TRC60_20PCS_BOX_LIST_BARKOD FROM trc60_20pcs_box_lıst");

        res.json(trc60guncelStock);
        
    } catch (error) {
        console.log("güncel stok çekme hatası ", error);
        
    }
    

});





//////////////////////////




module.exports = router;
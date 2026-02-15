const express = require("express");
const router = express.Router();

const db = require("../data/db");



router.get('/lowStock/get', async function (req, res) {

    try {

        // Önce 1000'in üzerinde olanların checked değerini sıfırla
        await db.execute(
            "UPDATE urunmalzemeleri SET checked = 0 WHERE urun_malzeme_adet >= lowstock"
        );




        const [lowStock] = await db.execute(
            "SELECT urun_malzeme_adi, urun_malzeme_adet , malzeme_id , checked,lowstock FROM urunmalzemeleri WHERE urun_malzeme_adet < lowstock ORDER BY urun_malzeme_adet ASC;"
        );

        res.json(lowStock);  // Malzeme miktarı 1000'in altında olan tüm kayıtları gönder

    } catch (error) {

        console.error("lowStock hatası", error);
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







router.post("/gunlukUretim", async function (req, res) {
    const urunName = req.body.urunName;
    const urunDetay = req.body.urunDetay;
    const urunAdet = req.body.urunAdet;
    const urunDate = req.body.urunDate;

    try {

        // Herhangi bir alan boşsa
        if (!urunName || !urunDetay || !urunAdet || !urunDate) {
            console.log("Alanlar boş bırakılamaz...");
            // Hata mesajı JSON olarak dönülüyor
            return res.redirect("/gunlukUretim?error=Alanlar%20boş%20bırakılamaz");
        }


        await db.execute("INSERT INTO savedata(urunName,urunDetay,urunAdet,urunDate) VALUES (?,?,?,?)", [urunName, urunDetay, urunAdet, urunDate])

        res.redirect("/gunlukUretim");
    }
    catch (err) {
        console.log("günlük üretim hatası", err);
    }

});




router.get('/urunler/get', async function (req, res) {

    try {
        const [urnList] = await db.execute("SELECT urun_key, urun_Name FROM urunler;");

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
    const { product, material, amount, action, date } = req.body;

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

            } else {
                newAmount = currentAmount - amountToUpdate;
            }

        }

        // Malzeme miktarını güncelle
        await db.execute(
            'UPDATE urunmalzemeleri SET urun_malzeme_adet = ? WHERE urun_malzeme_adi = ? AND urun_key = ?',
            [newAmount, material, productKey]
        );

        if (action === "GİRDİ") {

            addMesage = (`Ürün adı ${product} malzeme adı ${material} eklenen malzeme miktarı: ${amount} GÜNCEL ADET : ${newAmount} `);

            console.log(addMesage);


        } else {

            removeMesage = (`Ürün adı ${product} malzeme adı ${material} çıkarılan malzeme miktarı: ${amount} GÜNCEL ADET : ${newAmount} `);

            console.log(removeMesage);

        }


        // loglama 

        await db.execute(`INSERT INTO urun_malzeme_kayıtları (urun_adi, malzeme_adi, amount, action, date) VALUES (?,?,?,?,?)`, [product, material, amount, action, date]);

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
        // const [trc60UretimSayisi] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1001' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        // );

        const [trc60UretimSayisi] = await db.execute(`
            SELECT urun_key, urun_malzeme_adet ,malzeme_id
            FROM urunmalzemeleri 
            WHERE urun_key = '1001'
            AND malzeme_id NOT IN (8, 9,61)
            ORDER BY urun_malzeme_adet ASC
            LIMIT 1;
        `);


        res.json(trc60UretimSayisi);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

///////

router.get('/urunler/uretimSayiTrc01/get', async function (req, res) {

    try {
        // const [trc01UretimSayisi] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1002' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        // );

        const [trc01UretimSayisi] = await db.execute(`
            SELECT urun_key, urun_malzeme_adet ,malzeme_id
            FROM urunmalzemeleri 
            WHERE urun_key = '1002'
            AND malzeme_id NOT IN (15, 16,65)
            ORDER BY urun_malzeme_adet ASC
            LIMIT 1;
        `);


        res.json(trc01UretimSayisi);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

/////////////

router.get('/urunler/uretimSayiGZC24/get', async function (req, res) {

    try {
        // const [uretimSayiGZC24] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1003' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        // );

        const [uretimSayiGZC24] = await db.execute(`
            SELECT urun_key, urun_malzeme_adet ,malzeme_id
            FROM urunmalzemeleri 
            WHERE urun_key = '1003'
            AND malzeme_id NOT IN (24, 25,66)
            ORDER BY urun_malzeme_adet ASC
            LIMIT 1;
        `);


        res.json(uretimSayiGZC24);

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

///////////////

router.get('/urunler/uretimSayiGZC24Gold/get', async function (req, res) {

    try {

        // const [uretimSayiGZC24Gold] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1004' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        // );

        const [uretimSayiGZC24Gold] = await db.execute(`
            (
                SELECT urun_key, urun_malzeme_adet 
                FROM urunmalzemeleri 
                WHERE urun_key = '1003' 
                AND malzeme_id IN (27, 28, 29, 30, 31, 32)
            )
            UNION ALL
            (
                SELECT urun_key, urun_malzeme_adet 
                FROM urunmalzemeleri 
                WHERE urun_key = '1004'
            )
            ORDER BY urun_malzeme_adet ASC
            LIMIT 1;
        `);




        res.json(uretimSayiGZC24Gold);

    } catch (error) {

        console.error("gold üretim sayısı çekme hatası", error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

/////////////////////

router.get('/urunler/uretimSayiCasus/get', async function (req, res) {

    try {

        const [uretimSayicasus] = await db.execute(`
            SELECT urun_key, urun_malzeme_adet ,malzeme_id
            FROM urunmalzemeleri 
            WHERE urun_key = '1005'
            AND malzeme_id NOT IN (55, 56)
            ORDER BY urun_malzeme_adet ASC
            LIMIT 1;
        `);


        res.json(uretimSayicasus);

    } catch (error) {

        console.error("casus üretim sayısı çekme hatası", error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});

/////////////////////

router.get('/urunler/uretimSayiluvinka/get', async function (req, res) {

    try {
        // const [uretimSayiluvinka] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = '1006' ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        // );

        // const [uretimSayiluvinka] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key IN ('1006', '1001') ORDER BY urun_malzeme_adet ASC LIMIT 1;"
        // );

        const [uretimSayiluvinka] = await db.execute(`
            SELECT urun_key, urun_malzeme_adet ,malzeme_id
            FROM urunmalzemeleri 
            WHERE urun_key IN ('1006', '1001')
            AND malzeme_id NOT IN (8, 9,61)
            ORDER BY urun_malzeme_adet ASC
            LIMIT 1;
        `);



        res.json(uretimSayiluvinka);


    } catch (error) {

        console.error("Luvinka üretim sayısı çekme hatası", error);
        res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
    }

});



//////üretim sayısı///////////////////////////////////


////////malzeme ekleme save page //////////////////////


router.post('/urun/malzeme', async (req, res) => {

    const { urunAdi, urunAdet, urunPK, urunKey, checkedA, urunAltLimitA } = req.body;

    // aynı üründen varsa ekleme diye kod yazılacak 


    try {

        await db.execute("INSERT INTO urunmalzemeleri(urun_malzeme_adi,urun_malzeme_adet,urun_malzeme_PK,urun_key,checked,lowstock) VALUES (?,?,?,?,?,?)", [urunAdi, urunAdet, urunPK, urunKey, checkedA, urunAltLimitA]);

        console.log("ürün eklendindi", urunAdi, checkedA);


        // res.redirect("/urunKayit");

        res.json({ success: true });


    } catch (error) {

        console.log(error);

        res.status(500).json({ success: false });

    }


});



////////malzeme ekleme //////////////////////

//////////////ürün kartları /////////////////////////



//////////////ürün kartları /////////////////////////
/////////////////////////////////////////////////////////////loglama

router.get('/add/Remove', async function (req, res) {

    try {

        const [addRemove,] = await db.execute("select * from urun_malzeme_kayıtları")

        res.json(addRemove);

    } catch (error) {
        console.log("backend add/remove hatası :", error);
    }



})


///////////////////////////////////////////////////////////
///////////trc60 barkod kayıt ///////////////////////

let barkodCountertrc60 = 0; // 5 barkod sayacı

router.post("/barkod/data/save", async (req, res) => {
    const { barkod, barkodDateSave, cihazIdler } = req.body;


    console.log(typeof cihazIdler, cihazIdler);

    try {

        //ürünmalzemeleri tablosundan trc60 ın alt mazlemeleri çek
        // const [trc60urunMalzemeStok] = await db.execute("SELECT urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = 1001");

        const [urunMalzemeStoklari] = await db.execute("SELECT malzeme_id, urun_malzeme_adi , urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = 1001");

        const [midiBoxTrc60100Fınd] = await db.execute("SELECT TRC60_20PCS_BOX_LIST_BARKOD FROM trc60_20pcs_box_list WHERE TRC60_20PCS_BOX_LIST_BARKOD = ? ", [barkod]);

        if (midiBoxTrc60100Fınd.length > 0) {
            // return res.json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });
            // return console.log("bu barkod zaten daha önceden eklenmiş");
            return res.status(409).json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });

        }

        // //eğer stok 20 den az ise hata ver
        // if(trc60urunMalzemeStok.length === 0 || trc60urunMalzemeStok[0].urun_malzeme_adet < 20){
        //     console.log("TRC60 ALT MALZEMELERİNDE STOK YETERSİZ");
        //     // return res.json({ message: "TRC60 ALT MALZEMELERİNDE STOK YETERSİZ!" });
        //     return res.status(400).json({ success: false, message: "TRC60 ALT MALZEMELERİNDE STOK YETERSİZ!" });
        // }


        // Her malzeme için stok kontrolü //eğer stok 20 den az ise hata ver
        for (let malzeme of urunMalzemeStoklari) {
            const { malzeme_id, urun_malzeme_adi, urun_malzeme_adet } = malzeme;

            // Eğer herhangi bir malzemenin stoğu 20'den azsa hata ver
            if (urun_malzeme_adet < 20) {
                console.log(`Malzeme ID: ${malzeme_id} için stok yetersiz: ${urun_malzeme_adet}`);
                return res.status(400).json({ success: false, message: `MALZEME : ${urun_malzeme_adi} için stok yetersiz!` });
            }
        }
        //////////////////////////////////////////////////////////////////////////////////////////////

        // barkod ekle

        // await db.execute("INSERT INTO trc60_20pcs_box (trc60_20pcs_box_barkod, trc60_20pcs_box_date) VALUES (?,?)", [barkod, barkodDateSave])

        // 1️⃣ Barkod kaydı (boş satır oluşturur)
        const [insertResult] = await db.execute(
            "INSERT INTO trc60_20pcs_box (trc60_20pcs_box_barkod, trc60_20pcs_box_date) VALUES (?, ?)",
            [barkod, barkodDateSave]
        );

        // Eklenen satırın ID'si
        const boxId = insertResult.insertId;

        // 2️⃣ Cihaz ID'leri 20 kolona dağıt
        const cihazlar = Array(20).fill(null);

        cihazIdler.forEach((cihazId, index) => {
            if (index < 20) {
                cihazlar[index] = cihazId;
            }
        });

        // 3️⃣ Aynı satırı cihaz ID'lerle güncelle
        await db.execute(
            `
            UPDATE trc60_20pcs_box SET
                trc60_cihaz_id_1 = ?,
                trc60_cihaz_id_2 = ?,
                trc60_cihaz_id_3 = ?,
                trc60_cihaz_id_4 = ?,
                trc60_cihaz_id_5 = ?,
                trc60_cihaz_id_6 = ?,
                trc60_cihaz_id_7 = ?,
                trc60_cihaz_id_8 = ?,
                trc60_cihaz_id_9 = ?,
                trc60_cihaz_id_10 = ?,
                trc60_cihaz_id_11 = ?,
                trc60_cihaz_id_12 = ?,
                trc60_cihaz_id_13 = ?,
                trc60_cihaz_id_14 = ?,
                trc60_cihaz_id_15 = ?,
                trc60_cihaz_id_16 = ?,
                trc60_cihaz_id_17 = ?,
                trc60_cihaz_id_18 = ?,
                trc60_cihaz_id_19 = ?,
                trc60_cihaz_id_20 = ?
            WHERE id_20_pcs = ?
            `,
            [...cihazlar, boxId]
        );



        res.status(200).json({ message: "Barkod başarıyla kaydedildi!", barkod, barkodDateSave, cihazIdler });
        // res.status(200).send();

        ////////////////////////////////////////////////////////////////////////////////////////////////
        //stok yeterliyse 20 azalt 

        // 1- Normal malzemeler (id 3,5,8,9 HARİÇ) ➔ 20 azalt
        await db.execute(`
            UPDATE urunmalzemeleri 
            SET urun_malzeme_adet = urun_malzeme_adet - 20 
            WHERE urun_key = 1001 
            AND malzeme_id NOT IN (8,9,61)
        `);

        // 2- id = 8 ➔ 1 azalt
        await db.execute(`
            UPDATE urunmalzemeleri 
            SET urun_malzeme_adet = urun_malzeme_adet - 1 
            WHERE urun_key = 1001 
            AND malzeme_id IN (8, 61)
        `);

        // 3- id = 9 ➔ 5 barkodda 1 azalt
        barkodCountertrc60++;

        if (barkodCountertrc60 >= 5) {
            await db.execute(`
                UPDATE urunmalzemeleri 
                SET urun_malzeme_adet = urun_malzeme_adet - 1 
                WHERE urun_key = 1001 
                AND malzeme_id = 9
            `);

            barkodCountertrc60 = 0; // Sayaç sıfırlansın

        }

        // await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - 20 WHERE urun_key = 1001");


    } catch (error) {

        console.log("Barkod 20 pcs kayıt hatası:", error);
        res.status(500).json({ message: "Veri eklenirken hata oluştu!" });
    }


})


router.get("/barkod/data/save/get", async function (req, res) {

    try {

        const [barkod20pcs,] = await db.execute("SELECT id_20_pcs, trc60_20pcs_box_barkod , trc60_20pcs_box_date  FROM trc60_20pcs_box");

        res.json(barkod20pcs);






    } catch (error) {

        console.log("barkod data save hatası", error);
        res.status(500).json({ message: "Veri getirme hatası!" });

    }




});


router.get("/barkod/data/save/get/box/number", async function (req, res) {

    try {

        const [trc6020pcskutuAdet] = await db.execute("SELECT trc60_20pcs_box_barkod FROM trc60_20pcs_box");


        res.json(trc6020pcskutuAdet)

    } catch (error) {
        console.log("number box", error);
    }


})


////////////////////////////////////////////////////

///////////trc60/////////20////list/////


router.get("/trc60/20/box/barkod", async function (req, res) {

    try {

        const [trc60Box20pcsListİtem] = await db.execute("SELECT id, TRC60_20PCS_BOX_LIST_BARKOD, TRC60_20PCS_BOX_LIST_date FROM trc60_20pcs_box_list");

        const [trc60Box] = await db.execute("SELECT id_20_pcs, trc60_20pcs_box_barkod,trc60_20pcs_box_date,  trc60_cihaz_id_1 , trc60_cihaz_id_2 , trc60_cihaz_id_3 ,  trc60_cihaz_id_4 , trc60_cihaz_id_5 , trc60_cihaz_id_6 , trc60_cihaz_id_7 , trc60_cihaz_id_8 , trc60_cihaz_id_9 , trc60_cihaz_id_10, trc60_cihaz_id_11, trc60_cihaz_id_12, trc60_cihaz_id_13, trc60_cihaz_id_14, trc60_cihaz_id_15, trc60_cihaz_id_16, trc60_cihaz_id_17, trc60_cihaz_id_18, trc60_cihaz_id_19, trc60_cihaz_id_20 FROM trc60_20pcs_box")

        res.json(trc60Box);

    } catch (error) {
        console.log("trc60 20lik liste hatası", error);
        res.status(500).json({ message: "Liste çekme hatası" });

    }

});





/////////////////////////////////////////////

////////////trc60///////guncel/////stok/////

router.get("/trc60/guncel/stok/trc6020pcs", async function (req, res) {

    try {

        const [trc60guncelStock] = await db.execute("SELECT  TRC60_20PCS_BOX_LIST_BARKOD FROM trc60_20pcs_box_list");

        res.json(trc60guncelStock);

    } catch (error) {
        console.log("güncel stok çekme hatası ", error);

    }


});


//////////////////////////100lük barkod

router.get("/checkBarkod20/:barkod", async (req, res) => {
    try {
        const barkod = req.params.barkod;
        console.log(`Barkod kontrol ediliyor: ${barkod}`);

        // İlk tabloyu kontrol et
        const [boxResult] = await db.execute(
            "SELECT trc60_20pcs_box_barkod FROM trc60_20pcs_box WHERE trc60_20pcs_box_barkod = ?",
            [barkod]
        );

        // İkinci tabloyu kontrol et
        const [listResult] = await db.execute(
            "SELECT TRC60_20PCS_BOX_LIST_BARKOD FROM trc60_20pcs_box_list WHERE TRC60_20PCS_BOX_LIST_BARKOD = ?",
            [barkod]
        );

        // Eğer herhangi bir tabloda barkod varsa
        if (boxResult.length > 0 || listResult.length > 0) {
            console.log(`Barkod bulundu: ${barkod}`);
            return res.json({ exists: true });
        } else {
            console.log(`Barkod bulunamadı: ${barkod}`);
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error("Veritabanı hatası:", err);
        return res.status(500).json({ message: "Veritabanı hatası" });
    }
});


router.post("/save100lukuBox", async (req, res) => {
    const { barkod100, barkod20List, barkodDateFormat } = req.body;

    if (!barkod100 || barkod20List.length !== 5) {
        return res.status(400).json({ success: false, message: "Eksik veri gönderildi!" });
    }

    try {
        await db.execute(
            "INSERT INTO trc60_100_lu_box_lıst (trc60100lukutubarkod, trc6020col1, trc6020col2, trc6020col3, trc6020col4, trc6020col5,trc60100BoxDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [barkod100, ...barkod20List, barkodDateFormat]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Veritabanı hatası:", err);
        res.status(500).json({ success: false, message: "Veritabanı hatası!" });
    }
});


router.get("/trc60/100/box/list/get", async function (req, res) {

    try {

        const [trc60100boxlistitem] = await db.execute("SELECT id, trc60100lukutubarkod, trc6020col1, trc6020col2, trc6020col3, trc6020col4, trc6020col5, trc60100BoxDate FROM trc60_100_lu_box_lıst")

        res.json(trc60100boxlistitem);



    } catch (error) {
        console.log("100 lü liste veri çekme hatası", error)
    }

})





///////////////////////////////////////////////100lük barkod


///////////////////////////////////////////////////////////
///////////trc01 barkod kayıt ///////////////////////

router.post("/barkod/data/save/trc01", async (req, res) => {
    const { barkod, barkodDateSave, cihazIdler } = req.body;

    console.log(typeof cihazIdler, cihazIdler);

    try {

        //ürünmalzemeleri tablosundan trc01 ın alt mazlemeleri çek
        // const [trc01urunMalzemeKontrol] = await db.execute("SELECT urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = 1002");



        const [trc01urunMalzemeStok] = await db.execute("SELECT malzeme_id, urun_malzeme_adi, urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = 1002 AND malzeme_id NOT IN (15, 16, 65);");

        const [midiBoxTrc01100Fınd] = await db.execute("SELECT trc01_20pcs_box_list_barkod FROM trc01_20pcs_box_list WHERE trc01_20pcs_box_list_barkod = ? ", [barkod]);

        if (midiBoxTrc01100Fınd.length > 0) {
            // return res.json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });
            // return console.log("bu barkod zaten daha önceden eklenmiş");
            return res.status(409).json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });

        }



        //eğer stok 20 den az ise hata ver
        // if(trc01urunMalzemeStok.length === 0 || trc01urunMalzemeStok[0].urun_malzeme_adet < 20){
        //     console.log("TRC01 ALT MALZEMELERİNDE STOK YETERSİZ");
        //     // return res.json({ message: "TRC60 ALT MALZEMELERİNDE STOK YETERSİZ!" });
        //     return res.status(400).json({ success: false, message: "TRC01 ALT MALZEMELERİNDE STOK YETERSİZ!" });
        // }

        // Her malzeme için stok kontrolü //eğer stok 20 den az ise hata ver
        for (let malzeme of trc01urunMalzemeStok) {
            const { malzeme_id, urun_malzeme_adi, urun_malzeme_adet } = malzeme;

            // Eğer herhangi bir malzemenin stoğu 20'den azsa hata ver
            if (urun_malzeme_adet < 20) {
                console.log(`Malzeme ID: ${malzeme_id} için stok yetersiz: ${urun_malzeme_adet} MALZEME : ${urun_malzeme_adi} için stok yetersiz!  GİRİŞ YAPILAMAZ`);
                return res.status(400).json({ success: false, message: `MALZEME : ${urun_malzeme_adi} için stok yetersiz!  GİRİŞ YAPILAMAZ` });
            }
        }


        // barkod ekle

        // await db.execute("INSERT INTO trc01_20pcs_box (trc01_20pcs_box_barkod, trc01_20pcs_box_date) VALUES (?,?)", [barkod, barkodDateSave])
        // res.status(200).json({ message: "Barkod başarıyla kaydedildi!", barkod, barkodDateSave });
        // // res.status(200).send();


        // 1️⃣ Barkod kaydı (boş satır oluşturur)
        const [insertResult] = await db.execute(
            "INSERT INTO trc01_20pcs_box (trc01_20pcs_box_barkod, trc01_20pcs_box_date) VALUES (?, ?)",
            [barkod, barkodDateSave]
        );

        // Eklenen satırın ID'si
        const boxId = insertResult.insertId;

        // 2️⃣ Cihaz ID'leri 20 kolona dağıt
        const cihazlar = Array(20).fill(null);

        cihazIdler.forEach((cihazId, index) => {
            if (index < 20) {
                cihazlar[index] = cihazId;
            }
        });

        // 3️⃣ Aynı satırı cihaz ID'lerle güncelle
        await db.execute(
            `
            UPDATE trc01_20pcs_box SET
                trc01_cihaz_id_1 = ?,
                trc01_cihaz_id_2 = ?,
                trc01_cihaz_id_3 = ?,
                trc01_cihaz_id_4 = ?,
                trc01_cihaz_id_5 = ?,
                trc01_cihaz_id_6 = ?,
                trc01_cihaz_id_7 = ?,
                trc01_cihaz_id_8 = ?,
                trc01_cihaz_id_9 = ?,
                trc01_cihaz_id_10 = ?,
                trc01_cihaz_id_11 = ?,
                trc01_cihaz_id_12 = ?,
                trc01_cihaz_id_13 = ?,
                trc01_cihaz_id_14 = ?,
                trc01_cihaz_id_15 = ?,
                trc01_cihaz_id_16 = ?,
                trc01_cihaz_id_17 = ?,
                trc01_cihaz_id_18 = ?,
                trc01_cihaz_id_19 = ?,
                trc01_cihaz_id_20 = ?
            WHERE id_trc01_20pcs_box = ?
            `,
            [...cihazlar, boxId]
        );



        res.status(200).json({ message: "Barkod başarıyla kaydedildi!", barkod, barkodDateSave, cihazIdler });
        // res.status(200).send();

        ////////////////////////////////////////////////////////////////////////////////////////////////


        //stok yeterliyse 20 azalt 

        // 1- Normal malzemeler (id 3,5,8,9 HARİÇ) ➔ 20 azalt
        await db.execute(`
            UPDATE urunmalzemeleri 
            SET urun_malzeme_adet = urun_malzeme_adet - 20 
            WHERE urun_key = 1002 
            AND malzeme_id NOT IN (15,16,65)
        `);

        // 2- id = 8 ➔ 1 azalt
        await db.execute(`
            UPDATE urunmalzemeleri 
            SET urun_malzeme_adet = urun_malzeme_adet - 1 
            WHERE urun_key = 1002 
            AND malzeme_id IN (15, 65)
        `);

        // 3- id = 9 ➔ 5 barkodda 1 azalt
        barkodCountertrc60++;

        if (barkodCountertrc60 >= 5) {
            await db.execute(`
                UPDATE urunmalzemeleri 
                SET urun_malzeme_adet = urun_malzeme_adet - 1 
                WHERE urun_key = 1002 
                AND malzeme_id = 16
            `);

            barkodCountertrc60 = 0; // Sayaç sıfırlansın

        }

        // await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - 20 WHERE urun_key = 1002");


    } catch (error) {

        console.log("Barkod 20 pcs kayıt hatası:", error);
        res.status(500).json({ message: "Veri eklenirken hata oluştu!" });
    }


})


router.get("/barkod/data/save/get/trc01", async function (req, res) {

    try {

        const [trc01barkod20pcs,] = await db.execute("SELECT id_trc01_20pcs_box, trc01_20pcs_box_barkod , trc01_20pcs_box_date FROM trc01_20pcs_box");

        res.json(trc01barkod20pcs);






    } catch (error) {

        console.log("barkod data save hatası", error);
        res.status(500).json({ message: "Veri getirme hatası!" });

    }




});


router.get("/barkod/data/save/get/box/number/trc01", async function (req, res) {

    try {

        const [trc0120pcskutuAdet] = await db.execute("SELECT trc01_20pcs_box_barkod FROM trc01_20pcs_box");


        res.json(trc0120pcskutuAdet)

    } catch (error) {
        console.log("number box", error);
    }


})


////////////////////////////////////////////////////

///////////trc60/////////20////list/////


router.get("/trc01/20/box/barkod", async function (req, res) {

    // try {

    //     const [trc01Box20pcsListİtem] = await db.execute("SELECT id_trc01, trc01_20pcs_box_list_barkod, trc01_20pcs_box_list_date FROM trc01_20pcs_box_list");

    //     res.json(trc01Box20pcsListİtem);


    // } catch (error) {
    //     console.log("trc01 20lik liste hatası", error);
    // }

    try {

        const [trc01Box20pcsListİtem] = await db.execute("SELECT id_trc01, trc01_20pcs_box_list_barkod, trc01_20pcs_box_list_date FROM trc01_20pcs_box_list");

        const [trc01Box] = await db.execute("SELECT id_trc01_20pcs_box, trc01_20pcs_box_barkod,trc01_20pcs_box_date,  trc01_cihaz_id_1 , trc01_cihaz_id_2 , trc01_cihaz_id_3 ,  trc01_cihaz_id_4 , trc01_cihaz_id_5 , trc01_cihaz_id_6 , trc01_cihaz_id_7 , trc01_cihaz_id_8 , trc01_cihaz_id_9 , trc01_cihaz_id_10, trc01_cihaz_id_11, trc01_cihaz_id_12, trc01_cihaz_id_13, trc01_cihaz_id_14, trc01_cihaz_id_15, trc01_cihaz_id_16, trc01_cihaz_id_17, trc01_cihaz_id_18, trc01_cihaz_id_19, trc01_cihaz_id_20 FROM trc01_20pcs_box")

        res.json(trc01Box);

    } catch (error) {
        console.log("trc01 20lik liste hatası", error);
        res.status(500).json({ message: "Liste çekme hatası" });

    }

});





/////////////////////////////////////////////

////////////trc60///////guncel/////stok/////

router.get("/trc01/guncel/stok/trc0120pcs", async function (req, res) {

    try {

        const [trc01guncelStock] = await db.execute("SELECT  trc01_20pcs_box_list_barkod FROM trc01_20pcs_box_list");

        res.json(trc01guncelStock);

    } catch (error) {
        console.log("güncel stok çekme hatası ", error);

    }


});


//////////////////////////100lük barkod

router.get("/checkBarkod20/trc01/:barkod", async (req, res) => {
    try {
        const barkod = req.params.barkod;
        console.log(`Barkod kontrol ediliyor: ${barkod}`);

        // İlk tabloyu kontrol et
        const [boxResult] = await db.execute(
            "SELECT trc01_20pcs_box_barkod FROM trc01_20pcs_box WHERE trc01_20pcs_box_barkod = ?",
            [barkod]
        );

        // İkinci tabloyu kontrol et
        const [listResult] = await db.execute(
            "SELECT trc01_20pcs_box_list_barkod FROM trc01_20pcs_box_list WHERE trc01_20pcs_box_list_barkod = ?",
            [barkod]
        );

        // Eğer herhangi bir tabloda barkod varsa
        if (boxResult.length > 0 || listResult.length > 0) {
            console.log(`Barkod bulundu: ${barkod}`);
            return res.json({ exists: true });
        } else {
            console.log(`Barkod bulunamadı: ${barkod}`);
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error("Veritabanı hatası:", err);
        return res.status(500).json({ message: "Veritabanı hatası" });
    }
});


router.post("/save100lukuBox/trc01", async (req, res) => {
    const { barkod100, barkod20List, barkodDateFormat } = req.body;

    if (!barkod100 || barkod20List.length !== 5) {
        return res.status(400).json({ success: false, message: "Eksik veri gönderildi!" });
    }

    try {
        await db.execute(
            "INSERT INTO trc01_100pcs_box_list (trc01_100pcs_box_barkod, trc01_100pcs_col_1, trc01_100pcs_col_2, trc01_100pcs_col_3, trc01_100pcs_col_4, trc01_100pcs_col_5,trc01_100pcs_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [barkod100, ...barkod20List, barkodDateFormat]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Veritabanı hatası:", err);
        res.status(500).json({ success: false, message: "Veritabanı hatası!" });
    }
});


router.get("/trc01/100/box/list/get", async function (req, res) {

    try {

        const [trc01100boxlistitem] = await db.execute("SELECT id_trc01_100pcs, trc01_100pcs_box_barkod, trc01_100pcs_col_1, trc01_100pcs_col_2, trc01_100pcs_col_3, trc01_100pcs_col_4, trc01_100pcs_col_5, trc01_100pcs_date FROM trc01_100pcs_box_list")

        res.json(trc01100boxlistitem);



    } catch (error) {
        console.log("TRC01 100 lü liste veri çekme hatası", error);
    }

})





///////////////////////////////////////////////100lük barkod

///////////////////////////gzc24/////////////////

router.post("/gzc24/Anyday/post", async (req, res) => {

    const { cihazKutu, date, adet, day } = req.body;

    console.log(`Kutu sayısı ${cihazKutu} tarih ${date} üretim adeti ${adet} gün ayarı ${day}`);

    try {
        const [rows] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet, malzeme_id,urun_malzeme_adi  FROM urunmalzemeleri WHERE urun_key = 1003"
        );

        const [kutularEksiltme] = await db.execute(
            "SELECT urun_key, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1003 AND malzeme_id IN (24, 25 , 66)"
        );

        const [tekliÜrünlerEksiltme] = await db.execute(
            "SELECT urun_key, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1003 AND malzeme_id IN (31, 32)"

        );

        const [gzc24TumMalzemeler] = await db.execute("SELECT urun_malzeme_adi,urun_malzeme_adet FROM urunmalzemeleri WHERE urun_key = 1003 ");

        for (let malzeme of gzc24TumMalzemeler) {

            const { urun_malzeme_adi, urun_malzeme_adet } = malzeme;

            // console.log("malzemeler bulundu", urun_malzeme_adi);

            if (urun_malzeme_adet < cihazKutu) {

                throw new Error(`Malzeme : ${urun_malzeme_adi} için stok yetersiz işlem iptal edildi`);

                // console.log(`Malzeme : ${urun_malzeme_adi} için stok yetersiz işlem iptal edildi`);
                // return;

            }

        }


        let ignoreMalzemeIds = []; // En başta tanımla

        if (day === "20 DAY") {
            ignoreMalzemeIds = [29, 30, 24, 25, 31, 32, 66];
        } else if (day === "40 DAY") {
            ignoreMalzemeIds = [28, 30, 24, 25, 31, 32, 66];
        } else if (day === "60 DAY") {
            ignoreMalzemeIds = [28, 29, 24, 25, 31, 32, 66];
        } else {
            console.log("⚠️ Tanımlanamayan day değeri, tüm malzemeler kullanılacak.");
        }




        // Dışlananlar hariç malzemeleri filtrele
        const hedefMalzemeler = rows.filter(row => !ignoreMalzemeIds.includes(row.malzeme_id));

        // Her bir ürün 120 adet eksiltmeyi karşılayabiliyor mu kontrol et
        const yetersizler = hedefMalzemeler.filter(row => row.urun_malzeme_adet < adet);



        if (yetersizler.length > 0) {

            throw new Error(`ÜRÜN MALZEME STOKLARI YETERSİZ`);
            // console.log("Bazı malzemelerde yeterli adet yok! İşlem iptal edildi.");
            // return;
        }




        for (let row of hedefMalzemeler) {



            await db.execute(
                "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                [adet, row.malzeme_id]
            );

            // console.log(`✔ ${row.malzeme_id} ID'li malzemeden ${adet} adet eksiltildi.`);

        }

        console.log(`${ignoreMalzemeIds} ler hariç tüm malzemeler eksiltildi`);

        // 24 ve 25 için özel eksiltme
        for (let row of kutularEksiltme) {

            if (row.malzeme_id === 24) {
                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                    [cihazKutu, 24]
                );

                console.log(`✔ 24 numaralı malzemeden ${cihazKutu} adet eksiltildi.`);

            } else if (row.malzeme_id === 25) {

                const azaltmaAdeti = Math.floor(cihazKutu / 3);

                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                    [azaltmaAdeti, 25]
                );

                console.log(`✔ 25 numaralı malzemeden ${azaltmaAdeti} adet eksiltildi.`);

            } else if (row.malzeme_id === 66) {

                const koliazaltma = Math.floor(cihazKutu / 9);

                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                    [koliazaltma, 66]
                );

            }
        }

        for (let row of tekliÜrünlerEksiltme) {
            if (row.malzeme_id === 31) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [cihazKutu, 31]);
                console.log(`GZC24 için 31 id li malzemeden ${cihazKutu} kadar azaltıldı`);
            } else if (row.malzeme_id === 32) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [cihazKutu, 32])
                console.log(`GZC24 için 32 id li malzemeden ${cihazKutu} kadar azaltıldı`);
            } else {
                console.log("31 ve 32 eksiltilemedi")
            }
        }


    } catch (error) {
        console.log("❌ gzc24 Malzeme Çekme Hatası:", error.message);
        return res.status(500).json({ message: error.message });

    }

    //////////////////gzc24 listeye ekleme //////////////////////

    try {

        await db.execute("INSERT INTO gzc24_uretim_kayit (gzc24_kutu_sayisi, gzc24_uretim_adet, gzc24_uretim_day, gzc24_uretim_date) VALUES (?,?,?,?)", [cihazKutu, adet, day, date])



        console.log("başarı ile kayıt edildi");

        // Başarıyla işlem tamamlandığında sayfaya yönlendirme
        // res.redirect("/gzc24-production");  // Yalnızca bu satır yeterli

    } catch (error) {
        console.log("gzc24 üretim kayit", error);
    }

    ////////////////////////////////////////////////////////////


    return res.status(200).json({ message: "Üretim işlemi başarıyla tamamlandı" });

});


router.get("/gzc24/get/urun/kayit", async function (req, res) {

    try {

        const [gzc24UrunKayitList] = await db.execute("SELECT urun_İd , gzc24_kutu_sayisi ,gzc24_uretim_adet, gzc24_uretim_day, gzc24_uretim_date FROM gzc24_uretim_kayit ")

        res.json(gzc24UrunKayitList);



    } catch (error) {
        console.log("gzc24 urun kayıt çekme hatası", error);
    }



})








/////////////////////////gzc24////////////////////



///////////////////////////GOLD/////////////////

router.post("/gold/Anyday/post", async (req, res) => {

    const { cihazKutu, date, adet, day } = req.body;

    console.log(`Kutu sayısı ${cihazKutu} tarih ${date} üretim adeti ${adet} gün ayarı ${day}`);

    try {
        // const [rows] = await db.execute(
        //     "SELECT urun_key, urun_malzeme_adet, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1004"
        // );
        console.log(" İstek alındı:", req.body);

        const [rows] = await db.execute(`
            (
                SELECT urun_key, urun_malzeme_adet, malzeme_id 
                FROM urunmalzemeleri 
                WHERE urun_key = 1004
            )
            UNION ALL
            (
                SELECT urun_key, urun_malzeme_adet, malzeme_id 
                FROM urunmalzemeleri 
                WHERE urun_key = 1003 
                AND malzeme_id IN (23, 24, 25, 27, 28, 29, 30, 31, 32,68)
            )
        `);



        const [tekliÜrünlerEksiltme] = await db.execute(
            "SELECT urun_key, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1003 AND malzeme_id IN (23,27, 28, 29, 30,68)"

        );

        const [tekliEtketEksiltme] = await db.execute(
            "SELECT urun_key, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1003 AND malzeme_id IN (31, 32)"

        );

        const [kutularEksiltme] = await db.execute(
            "SELECT urun_key, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1003 AND malzeme_id IN (24, 25,66)"
        );




        let ignoreMalzemeIds = []; // En başta tanımla

        if (day === "20 DAY") {
            ignoreMalzemeIds = [29, 30, 24, 25, 31, 32];
        } else if (day === "40 DAY") {
            ignoreMalzemeIds = [28, 30, 24, 25, 31, 32];
        } else if (day === "60 DAY") {
            ignoreMalzemeIds = [28, 29, 24, 25, 31, 32];
        } else {
            console.log("⚠️ Tanımlanamayan day değeri, tüm malzemeler kullanılacak.");
        }


        try {

            // Dışlananlar hariç malzemeleri filtrele
            const hedefMalzemeler = rows.filter(row => !ignoreMalzemeIds.includes(row.malzeme_id));

            // Her bir ürün 120 adet eksiltmeyi karşılayabiliyor mu kontrol et
            const yetersizler = hedefMalzemeler.filter(row => row.urun_malzeme_adet < adet);

            if (yetersizler.length > 0) {
                console.log(" Yetersiz malzeme var:", yetersizler);
                // throw new Error("Bazı malzemelerde yeterli adet yok! İşlem iptal edildi.");
                return res.status(400).json({ message: "Bazı malzemelerde yeterli adet yok! İşlem iptal edildi." });

            }

            for (let row of hedefMalzemeler) {

                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1004 AND malzeme_id = ?",
                    [adet, row.malzeme_id]

                );

                // console.log(`✔ ${row.malzeme_id} ID'li malzemeden ${adet} adet eksiltildi.`);

            }

        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // // Dışlananlar hariç malzemeleri filtrele
        // const hedefMalzemeler = rows.filter(row => !ignoreMalzemeIds.includes(row.malzeme_id));

        // // Her bir ürün 120 adet eksiltmeyi karşılayabiliyor mu kontrol et
        // const yetersizler = hedefMalzemeler.filter(row => row.urun_malzeme_adet < adet);

        // if (yetersizler.length > 0) {
        //     throw new Error("Bazı malzemelerde yeterli adet yok! İşlem iptal edildi.");
        // }




        console.log(`${ignoreMalzemeIds} ler hariç tüm malzemeler eksiltildi`);

        // 24 ve 25 için özel eksiltme
        for (let row of kutularEksiltme) {
            if (row.malzeme_id === 24) {
                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                    [cihazKutu, 24]
                );
                console.log(`✔ 24 numaralı malzemeden ${cihazKutu} adet eksiltildi.`);
            } else if (row.malzeme_id === 25) {
                const azaltmaAdeti = Math.floor(cihazKutu / 3);
                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                    [azaltmaAdeti, 25]
                );
                console.log(`✔ 25 numaralı malzemeden ${azaltmaAdeti} adet eksiltildi.`);
            } else if (row.malzeme_id === 66) {
                const koliazaltma = Math.floor(cihazKutu / 9);
                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?",
                    [koliazaltma, 66]
                );
                console.log(`✔ 25 numaralı malzemeden ${koliazaltma} adet eksiltildi.`);
            }
        }

        for (let row of tekliÜrünlerEksiltme) {

            if (row.malzeme_id === 27 || row.malzeme_id === 23 || row.malzeme_id === 68) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [adet, row.malzeme_id]);
                console.log(`GOLD için 27 ve 23 ve 68 id li malzemeden ${adet} kadar azaltıldı`);
            } else if (day === "20 DAY" && row.malzeme_id === 28) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [adet, 28])
                console.log(`GOLD için 28 id li malzemeden ${adet} kadar azaltıldı`);
            } else if (day === "40 DAY" && row.malzeme_id === 29) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [adet, 29])
                console.log(`GOLD için 29 id li malzemeden ${adet} kadar azaltıldı`);
            } else if (day === "60 DAY" && row.malzeme_id === 30) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [adet, 30])
                console.log(`GOLD için 30 id li malzemeden ${adet} kadar azaltıldı`);
            } else {
                console.log("27,28,29 ve 30 eksiltilemedi")
            }

        }

        /////////////////////////////////////////////////////////

        for (let row of tekliEtketEksiltme) {
            if (row.malzeme_id === 31) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [cihazKutu, 31]);
                console.log(`GZC24 için 31 id li malzemeden ${cihazKutu} kadar azaltıldı`);
            } else if (row.malzeme_id === 32) {
                await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1003 AND malzeme_id = ?", [cihazKutu, 32])
                console.log(`GZC24 için 32 id li malzemeden ${cihazKutu} kadar azaltıldı`);
            } else {
                console.log("31 ve 32 eksiltilemedi")
            }
        }




    } catch (error) {
        console.log("❌ gold Malzeme Çekme Hatası:", error.message);
        return res.status(500).json({ message: error.message });

    }

    //////////////////gold listeye ekleme //////////////////////

    try {

        await db.execute("INSERT INTO gold_uretim_kayit (gold_kutu_sayisi, gold_uretim_adet, gold_uretim_day, gold_uretim_date) VALUES (?,?,?,?)", [cihazKutu, adet, day, date])



        console.log("başarı ile kayıt edildi");

        // Başarıyla işlem tamamlandığında sayfaya yönlendirme
        // res.redirect("/gzc24-production");  // Yalnızca bu satır yeterli

    } catch (error) {
        console.log("GOLD üretim kayit", error);
    }

    ////////////////////////////////////////////////////////////

    return res.status(200).json({ message: "Üretim işlemi başarıyla tamamlandı" });



});


router.get("/gold/get/urun/kayit", async function (req, res) {

    try {

        const [goldUrunKayitList] = await db.execute("SELECT urun_İd , gold_kutu_sayisi ,gold_uretim_adet, gold_uretim_day, gold_uretim_date FROM gold_uretim_kayit ")

        res.json(goldUrunKayitList);



    } catch (error) {
        console.log("GOLD urun kayıt çekme hatası", error);
    }



})




/////////////////////////GOLD////////////////////

/////////////////////etilen-sıvı//////////////////

router.post("/etilen/uretim/post", async function (req, res) {

    const { uretimKutu, uretim, date } = req.body;

    console.log(req.body)

    try {

        await db.execute("INSERT INTO etilen_s (etilen_uretim_kutu, etilen_uretim_adet, etilen_uretim_tarih ) VALUES (?,?,?)", [uretimKutu, uretim, date])



        console.log("başarı ile kayıt edildi");





    } catch (error) {
        console.log("etilen üretim kayıt hatası", error);
    }







})


router.get("/etilen/uretim/get", async function (req, res) {
    try {

        const [etilenUretim] = await db.execute("SELECT id_etilen, etilen_uretim_kutu , etilen_uretim_adet , etilen_uretim_tarih FROM etilen_s")

        res.json(etilenUretim);


    } catch (error) {
        console.log("etilen üretim kayıt çekme hatası", error);
    }

})




/////////////////////etilen-sıvı//////////////////


/////////////////////etilen-jeneratör//////////////////

router.post("/etilen/jenerator/uretim/post", async function (req, res) {

    const { uretimKutu, date } = req.body;

    console.log(req.body)

    try {

        await db.execute("INSERT INTO etilen_jenerator ( etilen_jenerator_adet, etilen_jenerator_date ) VALUES (?,?)", [uretimKutu, date])



        console.log("başarı ile kayıt edildi");





    } catch (error) {
        console.log("etilen üretim kayıt hatası", error);
    }







})


router.get("/etilen/jenerator/uretim/get", async function (req, res) {
    try {

        const [etilenUretim] = await db.execute("SELECT jenerator_id, etilen_jenerator_adet , etilen_jenerator_date FROM etilen_jenerator")

        res.json(etilenUretim);


    } catch (error) {
        console.log("etilen üretim kayıt çekme hatası", error);
    }

})





/////////////////////etilen-jeneratör//////////////////


//////////////////////casus////////////////////////////


router.post("/casus/Anyday/post", async (req, res) => {

    const { cihazKutu, date, adet, day } = req.body;

    console.log(`Kutu sayısı ${cihazKutu} tarih ${date} üretim adeti ${adet} gün ayarı ${day}`);

    console.log(`gün ayarı ${day}`);

    try {
        const [rows] = await db.execute(
            "SELECT urun_key, urun_malzeme_adet, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1005"
        );



        const [kutularEksiltme] = await db.execute(
            "SELECT urun_key, malzeme_id FROM urunmalzemeleri WHERE urun_key = 1005 AND malzeme_id IN (55, 56)"
        );




        let ignoreMalzemeIds = [];

        if (day === "20 DAY") {
            // 20 day üretimde sadece 49 çalışır
            ignoreMalzemeIds = [50, 51, 55, 56];
        }
        else if (day === "40 DAY") {
            // 40 day üretimde sadece 50 çalışır
            ignoreMalzemeIds = [49, 51, 55, 56];
        }
        else if (day === "75 DAY") {
            // 75 day üretimde sadece 51 çalışır
            ignoreMalzemeIds = [49, 50, 55, 56];
        }
        else {
            console.log("⚠️ Tanımlanamayan day değeri, tüm malzemeler kullanılacak.");
        }






        // Dışlananlar hariç malzemeleri filtrele
        const hedefMalzemeler = rows.filter(row => !ignoreMalzemeIds.includes(row.malzeme_id));



        // Her bir ürün 120 adet eksiltmeyi karşılayabiliyor mu kontrol et
        const yetersizler = hedefMalzemeler.filter(row => row.urun_malzeme_adet < adet);

        if (yetersizler.length > 0) {
            throw new Error("Bazı malzemelerde yeterli adet yok! İşlem iptal edildi.");
        }


        for (let row of hedefMalzemeler) {



            await db.execute(
                "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1005 AND malzeme_id = ?",
                [adet, row.malzeme_id]
            );

            // console.log(`✔ ${row.malzeme_id} ID'li malzemeden ${adet} adet eksiltildi.`);

        }

        console.log(`${ignoreMalzemeIds} ler hariç tüm malzemeler eksiltildi`);

        // 49 ve 50 için özel eksiltme
        for (let row of kutularEksiltme) {
            if (row.malzeme_id === 55) {
                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1005 AND malzeme_id = ?",
                    [cihazKutu, 55]
                );
                console.log(`✔ 55 numaralı malzemeden ${cihazKutu} adet eksiltildi.`);
            } else if (row.malzeme_id === 56) {
                const azaltmaAdeti = Math.floor(cihazKutu / 3);
                await db.execute(
                    "UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - ? WHERE urun_key = 1005 AND malzeme_id = ?",
                    [azaltmaAdeti, 56]
                );
                console.log(`✔ 56 numaralı malzemeden ${azaltmaAdeti} adet eksiltildi.`);
            }
        }


    } catch (error) {
        console.log("❌ casus Malzeme Çekme Hatası:", error.message);
        return res.status(500).json({ message: error.message });

    }

    //////////////////casus listeye ekleme //////////////////////

    try {

        await db.execute("INSERT INTO casus_uretim (casus_uretim_kutu_adet, casus_uretim_adet, casus_uretim_day, casus_uretim_date) VALUES (?,?,?,?)", [cihazKutu, adet, day, date])



        console.log("başarı ile kayıt edildi");

        // Başarıyla işlem tamamlandığında sayfaya yönlendirme
        // res.redirect("/gzc24-production");  // Yalnızca bu satır yeterli

    } catch (error) {
        console.log("casus üretim kayit", error);
    }

    ////////////////////////////////////////////////////////////

});


//////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/casus/get/urun/kayit", async function (req, res) {

    try {

        const [casusUrunKayitList] = await db.execute("SELECT casus_id , casus_uretim_kutu_adet ,casus_uretim_adet, casus_uretim_day, casus_uretim_date FROM casus_uretim ")

        res.json(casusUrunKayitList);



    } catch (error) {
        console.log("casus urun kayıt çekme hatası", error);
    }



})




//////////////////////casus////////////////////////////

//////////////////////luvinka/////////////////////////

// Sayaç için basit bir değişken
let barkodCounter = 0;

router.post("/luvinka/20/pcsbox/barkod/save", async (req, res) => {
    const { barkod, barkodDateSave, cihazIdler } = req.body;

    console.log(typeof cihazIdler, cihazIdler);

    try {

        //ürünmalzemeleri tablosundan TRC60 ın alt mazlemeleri çek
        const [trc60urunMalzemeStok] = await db.execute("SELECT urun_malzeme_adet,urun_malzeme_adi FROM urunmalzemeleri WHERE urun_key = 1001");

        //ürünmalzemeleri tablosundan Luvinka ın alt mazlemeleri çek
        const [luvinkaUrunMalzemeStok] = await db.execute("SELECT urun_malzeme_adet,urun_malzeme_adi FROM urunmalzemeleri WHERE urun_key = 1006");

        // 20 lik ve 100 lük kutu kayıt kontrolü aynı barkodu eklememek için ///

        const [midiBoxTrc60100Fınd] = await db.execute("SELECT luvinka_20_box_list_barkod FROM luvinka_20_box_list WHERE luvinka_20_box_list_barkod = ? ", [barkod]);

        if (midiBoxTrc60100Fınd.length > 0) {
            // return res.json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });
            // return console.log("bu barkod zaten daha önceden eklenmiş");
            return res.status(409).json({ success: false, message: "Bu barkod zaten daha önceden eklenmiş!" });

        }

        // //eğer stok 20 den az ise hata ver
        // if(luvinkaUrunMalzemeStok === 0 || trc60urunMalzemeStok.length === 0 || trc60urunMalzemeStok[0].urun_malzeme_adet < 20){
        //     console.log("LUVİNKA ALT MALZEMELERİNDE STOK YETERSİZ");
        //     // return res.json({ message: "TRC60 ALT MALZEMELERİNDE STOK YETERSİZ!" });
        //     return res.status(400).json({ success: false, message: "LUVİNKA ALT MALZEMELERİNDE STOK YETERSİZ!" });
        // }

        const luvinkatumMalzemeler = [...trc60urunMalzemeStok, ...luvinkaUrunMalzemeStok];

        // Her malzeme için stok kontrolü //eğer stok 20 den az ise hata ver
        for (let malzeme of luvinkatumMalzemeler) {
            const { urun_malzeme_adi, urun_malzeme_adet } = malzeme;

            // Eğer herhangi bir malzemenin stoğu 20'den azsa hata ver
            if (urun_malzeme_adet < 20) {
                console.log(`MALZEME : ${urun_malzeme_adi} için stok yetersiz`);
                return res.status(400).json({ success: false, message: ` GİRİŞ YAPILAMAZ : ${urun_malzeme_adi} için stok yetersiz!` });
            }
        }


        // barkod ekle

        // await db.execute("INSERT INTO luvinka_20_box (luvinka_20_box_barkod, luvinka_20_box_date) VALUES (?,?)", [barkod, barkodDateSave])
        // res.status(200).json({ message: "Barkod başarıyla kaydedildi!", barkod, barkodDateSave });
        // res.status(200).send();

        // 1️⃣ Barkod kaydı (boş satır oluşturur)
        const [insertResult] = await db.execute(
            "INSERT INTO luvinka_20_box (luvinka_20_box_barkod, luvinka_20_box_date) VALUES (?, ?)",
            [barkod, barkodDateSave]
        );

        // Eklenen satırın ID'si
        const boxId = insertResult.insertId;

        // 2️⃣ Cihaz ID'leri 20 kolona dağıt
        const cihazlar = Array(20).fill(null);

        cihazIdler.forEach((cihazId, index) => {
            if (index < 20) {
                cihazlar[index] = cihazId;
            }
        });

        // 3️⃣ Aynı satırı cihaz ID'lerle güncelle
        await db.execute(
            `
            UPDATE luvinka_20_box SET
                luvinka_cihaz_id_1 = ?,
                luvinka_cihaz_id_2 = ?,
                luvinka_cihaz_id_3 = ?,
                luvinka_cihaz_id_4 = ?,
                luvinka_cihaz_id_5 = ?,
                luvinka_cihaz_id_6 = ?,
                luvinka_cihaz_id_7 = ?,
                luvinka_cihaz_id_8 = ?,
                luvinka_cihaz_id_9 = ?,
                luvinka_cihaz_id_10 = ?,
                luvinka_cihaz_id_11 = ?,
                luvinka_cihaz_id_12 = ?,
                luvinka_cihaz_id_13 = ?,
                luvinka_cihaz_id_14 = ?,
                luvinka_cihaz_id_15 = ?,
                luvinka_cihaz_id_16 = ?,
                luvinka_cihaz_id_17 = ?,
                luvinka_cihaz_id_18 = ?,
                luvinka_cihaz_id_19 = ?,
                luvinka_cihaz_id_20 = ?
            WHERE id_luvinka_20_box = ?
            `,
            [...cihazlar, boxId]
        );



        res.status(200).json({ message: "Barkod başarıyla kaydedildi!", barkod, barkodDateSave, cihazIdler });
        // res.status(200).send();

        ///////////////////////////////////////////////////////////////////

        //stok yeterliyse 20 azalt 

        // await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - 20 WHERE urun_key = 1001");

        // Stok azaltmalar:

        // 1- Normal malzemeler (id 3,5,8,9 HARİÇ) ➔ 20 azalt
        await db.execute(`
            UPDATE urunmalzemeleri 
            SET urun_malzeme_adet = urun_malzeme_adet - 20 
            WHERE urun_key = 1001 
            AND malzeme_id NOT IN (3,5,8,9)
        `);

        // 2- id = 8 ➔ 1 azalt
        await db.execute(`
            UPDATE urunmalzemeleri 
            SET urun_malzeme_adet = urun_malzeme_adet - 1 
            WHERE urun_key = 1001 
            AND malzeme_id = 8
        `);

        // 3- id = 9 ➔ 5 barkodda 1 azalt
        barkodCounter++;

        if (barkodCounter >= 5) {
            await db.execute(`
                UPDATE urunmalzemeleri 
                SET urun_malzeme_adet = urun_malzeme_adet - 1 
                WHERE urun_key = 1001 
                AND malzeme_id = 9
            `);

            barkodCounter = 0; // Sayaç sıfırlansın

        }

        await db.execute("UPDATE urunmalzemeleri SET urun_malzeme_adet = urun_malzeme_adet - 20 WHERE urun_key = 1006");


    } catch (error) {

        console.log("Barkod 20 pcs kayıt hatası:", error);
        res.status(500).json({ message: "Veri eklenirken hata oluştu!" });
    }


})


router.get("/luvinka/barkod/data/save/get", async function (req, res) {

    try {

        const [Luvinkabarkod20pcs,] = await db.execute("SELECT id_luvinka_20_box, luvinka_20_box_barkod , luvinka_20_box_date FROM luvinka_20_box");

        res.json(Luvinkabarkod20pcs);






    } catch (error) {

        console.log("barkod data save hatası", error);
        res.status(500).json({ message: "Veri getirme hatası!" });

    }




});


router.get("/luvinka/barkod/data/save/get/box/number", async function (req, res) {

    try {

        const [luvinka20pcskutuAdet] = await db.execute("SELECT luvinka_20_box_barkod FROM luvinka_20_box");


        res.json(luvinka20pcskutuAdet)

    } catch (error) {
        console.log("number box", error);
    }


})


////////////////////////////////////////////////////

///////////luvinka/////////20////list/////


router.get("/luvinka/20/box/barkod", async function (req, res) {

    try {

        // const [luvinkaBox20pcsListİtem] = await db.execute("SELECT id_luvinka_20_box_list, luvinka_20_box_list_barkod, luvinka_20_box_list_date FROM luvinka_20_box_list");

        // res.json(luvinkaBox20pcsListİtem);



        const [LuvinkaBox] = await db.execute("SELECT id_luvinka_20_box, luvinka_20_box_barkod,luvinka_20_box_date,  luvinka_cihaz_id_1 , luvinka_cihaz_id_2 , luvinka_cihaz_id_3 ,  luvinka_cihaz_id_4 , luvinka_cihaz_id_5 , luvinka_cihaz_id_6 , luvinka_cihaz_id_7 , luvinka_cihaz_id_8 , luvinka_cihaz_id_9 , luvinka_cihaz_id_10, luvinka_cihaz_id_11, luvinka_cihaz_id_12, luvinka_cihaz_id_13, luvinka_cihaz_id_14, luvinka_cihaz_id_15, luvinka_cihaz_id_16, luvinka_cihaz_id_17, luvinka_cihaz_id_18, luvinka_cihaz_id_19, luvinka_cihaz_id_20 FROM luvinka_20_box")

        res.json(LuvinkaBox);


    } catch (error) {
        console.log("luvinka 20lik liste hatası", error);
    }

});





/////////////////////////////////////////////

////////////luvinka///////guncel/////stok/////

router.get("/luvinka/guncel/stok/trc6020pcs", async function (req, res) {

    try {

        const [luvinkaguncelStock] = await db.execute("SELECT  luvinka_20_box_list_barkod FROM luvinka_20_box_list");

        res.json(luvinkaguncelStock);

    } catch (error) {
        console.log("güncel stok çekme hatası ", error);

    }


});


//////////////////////////100lük barkod

router.get("/luvinka/checkBarkod20/:barkod", async (req, res) => {
    try {
        const barkod = req.params.barkod;
        console.log(`Barkod kontrol ediliyor: ${barkod}`);

        // İlk tabloyu kontrol et
        const [boxResult] = await db.execute(
            "SELECT luvinka_20_box_barkod FROM luvinka_20_box WHERE luvinka_20_box_barkod = ?",
            [barkod]
        );


        // İkinci tabloyu kontrol et
        const [listResult] = await db.execute(
            "SELECT luvinka_20_box_list_barkod FROM luvinka_20_box_list WHERE luvinka_20_box_list_barkod = ?",
            [barkod]
        );



        // Eğer herhangi bir tabloda barkod varsa
        if (boxResult.length > 0 || listResult.length > 0) {
            console.log(`Barkod bulundu: ${barkod}`);
            return res.status(200).json({ exists: true });
        } else {
            console.log(`Barkod bulunamadı: ${barkod}`);
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error("Veritabanı hatası:", err);
        return res.status(500).json({ message: "Veritabanı hatası" });
    }
});



router.post("/luvinka/save100lukuBox", async (req, res) => {
    const { barkod100, barkod20List, barkodDateFormat } = req.body;

    if (!barkod100 || barkod20List.length !== 5) {
        return res.status(400).json({ success: false, message: "Eksik veri gönderildi!" });
    }

    try {
        await db.execute(
            "INSERT INTO luvinka_100_box_list (luvinka_100_box_barkod, luvinka_col_1, luvinka_col_2, luvinka_col_3, luvinka_col_4, luvinka_col_5,luvinka_100_box_list_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [barkod100, ...barkod20List, barkodDateFormat]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Veritabanı hatası:", err);
        res.status(500).json({ success: false, message: "Veritabanı hatası!" });
    }
});


router.get("/luvinka/100/box/list/get", async function (req, res) {

    try {

        const [luvinka100boxlistitem] = await db.execute("SELECT id_luvinka_100_box_list, luvinka_100_box_barkod, luvinka_col_1, luvinka_col_2, luvinka_col_3, luvinka_col_4, luvinka_col_5, luvinka_100_box_list_date FROM luvinka_100_box_list")

        res.json(luvinka100boxlistitem);



    } catch (error) {
        console.log("100 lü liste veri çekme hatası", error)
    }

})





///////////////////////////////////////////////100lük barkod








//////////////////////luvinka/////////////////////////



module.exports = router;
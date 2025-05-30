const express = require("express");
const router = express.Router();

const db = require("../data/db"); 
const { route } = require("./get_post");

const data = {
    title : "Homepage",
    cards:" rows"
}

router.get("/luvinka-100-box", async function (req, res) {
    try {

        res.render("users/luvinka-100-box", {
            title: "STOCK APP",
        })
        
    } catch (error) {
        console.log("luvinka-100-box sayfası hata" , error);
    }
})

router.get("/luvinka-20-box", async function (req, res) {
    try {

        res.render("users/luvinka-20-box", {
            title: "STOCK APP",
        })
        
    } catch (error) {
        console.log("luvinka-20-box sayfası hata" , error);
    }
})


router.get("/luvinka-production", async function (req, res) {
    try {

        res.render("users/luvinka-production", {
            title: "STOCK APP",
        })
        
    } catch (error) {
        console.log("luvinka-production sayfası hata" , error);
    }
})

router.get("/casus-production", async function (req, res) {
    try {

        res.render("users/casus-production", {
            title: "STOCK APP",
        })
        
    } catch (error) {
        console.log("etilen sayfası hata" , error);
    }
})

router.get("/etilen_jenerator", async function (req, res) {
    try {

        res.render("users/etilen_jenerator", {
            title: "STOCK APP",
        })
        
    } catch (error) {
        console.log("etilen sayfası hata" , error);
    }
})

router.get("/etilen_s", async function (req, res) {
    try {

        res.render("users/etilen_s", {
            title: "STOCK APP",
        })
        
    } catch (error) {
        console.log("etilen sayfası hata" , error);
    }
})

router.get("/gold-production", async function (req, res) {

    try {

        res.render("users/gold-production",{
            title: "STOCK APP",
        });
        
    } catch (error) {
        console.log("GOLD üretim sayfası", error);
    }

})



router.get("/gzc24-production", async function (req, res) {

    try {

        res.render("users/gzc24-production",{
            title: "STOCK APP",
        });
        
    } catch (error) {
        console.log("Gzc24 üretim sayfası", error);
    }

})




router.get("/trc01-production", async function (req, res) {
   
    try {

        res.render("users/trc01-production", {
            title: "STOCK APP",
        })


    } catch (error) {
        console.log("trc01-production", error);
    }
    

});

router.get("/trc01-20barkod", async function (req, res) {
   
    try {

        res.render("users/trc01-20barkod", {
            title: "STOCK APP",
        })


    } catch (error) {
        console.log("trc01-20barkod", error);
    }
    

});

router.get("/trc01-100-box-tabs", async function (req, res) {
   
    try {

        res.render("users/trc01-100-box-tabs", {
            title: "STOCK APP",
        })


    } catch (error) {
        console.log("trc01-100-box-tabs", error);
    }
    

});


//////////////////////////////////////////////////////////////////


router.get("/trc60-20barkod", async function (req, res) {
   
    try {

        res.render("users/trc60-20barkod", {
            title: "STOCK APP",
        })


    } catch (error) {
        console.log("20lik kutu hatası", error);
    }
    

});

router.get("/trc60-production",async  function(req, res){

    try {
       
        
        res.render("users/trc60-production",{
            title: "STOCK APP",
            
        });
        
    } catch (error) {
        console.log(error);
    }
    
    
});

router.get("/trc60-100-box-tabs", async function (req, res) {
    try {

        res.render("users/trc60-100-box-tabs",{
            title:"STOCK APP",
        });

    } catch (error) {

        console.log("100lü box listesi yüklenmiyor",error);

    }
})

////////////////////////////////////////////////////////////////////


router.get("/liveScreen",async  function(req, res){

    try {
       
        
        res.render("users/liveScreen",{
            title: "STOCK APP",
            
        });
        
    } catch (error) {
        console.log(error);
    }
    
    
});

//////////////////////////////////////////////////////////////////////

router.get("/StockScreen", async function (req, res) {
    
    try {

        res.render("users/StockScreen",{
            title : "STOCK APP", 

        })
        
    } catch (error) {
        console.log("stockscreen hatası" , error);
    }
    
});

router.get("/gunlukUretim",async  function(req, res){

    try {
        const [saveDayData, ] = await db.execute("select * from savedata")
        
        res.render("users/gunlukUretim",{
            title:"STOCK APP",
            daySaveData : saveDayData
        });
        
    } catch (error) {
        console.log(error);
    }


});

router.use("/urunKayit", async function(req, res){

    res.render("users/urunKayit",{
        title:"STOCK APP",
        
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

            title:"STOCK APP",
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
            title:"STOCK APP",
            urunName: stokCard,
            
            
        });
    }
    catch(err){
        console.log(err);
    }

   
});

router.get("/login", async function(req, res){

    try {

        res.render("users/login",{
            title:"STOCKAPP",
        })
        
    } catch (error) {
        console.log("login hatası",error)
    }


})

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await db.query(
            "SELECT * FROM users WHERE user_name = ? AND user_password = ?",
            [username, password]
        );

        if (results.length > 0) {
            const user = results[0];

            // BURADA role ve username döndürmelisin
            res.json({
                success: true,
                username: user.user_name,
                role: user.role // <-- Bunu eklemezsen frontend undefined alır
            });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, error: "Sunucu hatası" });
        console.error("Login error:", err.sqlMessage || err.message);

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
const express = require("express");
const router = express.Router();
const db = require("../data/db");
const sendLowStockEmail = require("../send/mail");

router.get("/run-daily-report", async (req, res) => {
  // Güvenlik token kontrolü
  const token = req.query.token;
  if (token !== "gizli123") {
    return res.status(403).send("Yetkisiz erişim.");
  }

  try {
    const [lowStockrows] = await db.execute(`
      SELECT urun_malzeme_adi, urun_malzeme_adet , malzeme_id , checked 
      FROM urunmalzemeleri 
      WHERE urun_malzeme_adet < 1000 
      ORDER BY urun_malzeme_adet ASC;
    `);

    const [gzc24mailRows] = await db.execute(`
      SELECT gzc24_kutu_sayisi,gzc24_uretim_adet,gzc24_uretim_day,gzc24_uretim_date 
      FROM gzc24_uretim_kayit 
      WHERE DATE(gzc24_uretim_date) = CURDATE();
    `);

    const [GOLDmailRows] = await db.execute(`
      SELECT gold_kutu_sayisi,gold_uretim_adet,gold_uretim_day,gold_uretim_date 
      FROM gold_uretim_kayit 
      WHERE DATE(gold_uretim_date) = CURDATE();
    `);

    const [trc60MailRows] = await db.execute(`
      SELECT TRC60_20PCS_BOX_LIST_BARKOD, TRC60_20PCS_BOX_LIST_date 
      FROM trc60_20pcs_box_list 
      WHERE STR_TO_DATE(TRC60_20PCS_BOX_LIST_date, '%d.%m.%Y') = CURDATE();
    `);

    const [trc01MailRows] = await db.execute(`
      SELECT trc01_20pcs_box_list_barkod, trc01_20pcs_box_list_date 
      FROM trc01_20pcs_box_list 
      WHERE STR_TO_DATE(trc01_20pcs_box_list_date, '%d.%m.%Y') = CURDATE();
    `);

    const [luvinkaMailRows] = await db.execute(`
      SELECT luvinka_20_box_list_barkod, luvinka_20_box_list_date 
      FROM luvinka_20_box_list 
      WHERE STR_TO_DATE(luvinka_20_box_list_date, '%d.%m.%Y') = CURDATE();
    `);

    const [casusmailRows] = await db.execute(`
      SELECT casus_uretim_kutu_adet,casus_uretim_adet,casus_uretim_day,casus_uretim_date 
      FROM casus_uretim 
      WHERE DATE(casus_uretim_date) = CURDATE();
    `);

    const [etilenSivimailRows] = await db.execute(`
      SELECT etilen_uretim_kutu, etilen_uretim_adet, etilen_uretim_tarih 
      FROM etilen_s 
      WHERE DATE(etilen_uretim_tarih) = CURDATE();
    `);

    const [etilenJeneratorMailRows] = await db.execute(`
      SELECT etilen_jenerator_adet, etilen_jenerator_date 
      FROM etilen_jenerator 
      WHERE DATE(etilen_jenerator_date) = CURDATE();
    `);

    const allDataEmpty =
      gzc24mailRows.length === 0 &&
      trc60MailRows.length === 0 &&
      trc01MailRows.length === 0 &&
      luvinkaMailRows.length === 0 &&
      casusmailRows.length === 0 &&
      etilenSivimailRows.length === 0 &&
      etilenJeneratorMailRows.length === 0;

    if (allDataEmpty) {
      console.log("Bugüne ait hiçbir veri yok, mail gönderilmiyor.");
      return res.send("Bugüne ait veri bulunamadı. Mail gönderilmedi.");
    }

    await sendLowStockEmail(
      lowStockrows,
      gzc24mailRows,
      trc60MailRows,
      trc01MailRows,
      luvinkaMailRows,
      casusmailRows,
      etilenSivimailRows,
      etilenJeneratorMailRows
    );

    console.log("Rapor gönderildi.");
    res.send("Rapor başarıyla gönderildi.");
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).send("Bir hata oluştu: " + err.message);
  }
});

module.exports = router;

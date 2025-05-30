const db = require("../data/db");
const sendLowStockEmail = require("../send/mail");

async function runDailyReport() {
  try {
    // Veritabanından verileri çekiyoruz
        const [lowStockrows] = await db.execute(
             "SELECT urun_malzeme_adi, urun_malzeme_adet , malzeme_id , checked FROM urunmalzemeleri WHERE urun_malzeme_adet < 1000 ORDER BY urun_malzeme_adet ASC;"
           );
   
        const [gzc24mailRows] = await db.execute(
             "SELECT gzc24_kutu_sayisi,gzc24_uretim_adet,gzc24_uretim_day,gzc24_uretim_date FROM gzc24_uretim_kayit WHERE DATE(gzc24_uretim_date) = CURDATE();"
           );
   
        const [trc60MailRows] = await db.execute(
               `SELECT TRC60_20PCS_BOX_LIST_BARKOD, TRC60_20PCS_BOX_LIST_date 
               FROM trc60_20pcs_box_list 
               WHERE STR_TO_DATE(TRC60_20PCS_BOX_LIST_date, '%d.%m.%Y') = CURDATE();`
           );
   
   
        const [trc01MailRows] = await db.execute(
               `SELECT trc01_20pcs_box_list_barkod, trc01_20pcs_box_list_date 
               FROM trc01_20pcs_box_list 
               WHERE STR_TO_DATE(trc01_20pcs_box_list_date, '%d.%m.%Y') = CURDATE();`
           );
   
   
        const [luvinkaMailRows] = await db.execute(
               `SELECT luvinka_20_box_list_barkod, luvinka_20_box_list_date 
               FROM luvinka_20_box_list 
               WHERE STR_TO_DATE(luvinka_20_box_list_date, '%d.%m.%Y') = CURDATE();`
           );
   
   
        const [casusmailRows] = await db.execute(
             "SELECT casus_uretim_kutu_adet,casus_uretim_adet,casus_uretim_day,casus_uretim_date FROM casus_uretim WHERE DATE(casus_uretim_date) = CURDATE();"
           );
   
        const [etilenSivimailRows] = await db.execute(
             "SELECT etilen_uretim_kutu, etilen_uretim_adet, etilen_uretim_tarih FROM etilen_s WHERE DATE(etilen_uretim_tarih) = CURDATE();"
           );
   
        const [etilenJeneratorMailRows] = await db.execute(
               "SELECT etilen_jenerator_adet, etilen_jenerator_date FROM etilen_jenerator WHERE DATE (etilen_jenerator_date) = CURDATE();"
   
           );

            // BOŞ KONTROLÜ
    const allDataEmpty =
      // lowStockrows.length === 0 &&
      gzc24mailRows.length === 0 &&
      trc60MailRows.length === 0 &&
      trc01MailRows.length === 0 &&
      luvinkaMailRows.length === 0 &&
      casusmailRows.length === 0 &&
      etilenSivimailRows.length === 0 &&
      etilenJeneratorMailRows.length === 0;

    if (allDataEmpty) {
      console.log("Bugüne ait hiçbir veri bulunamadı, mail gönderilmiyor.");
      return;
    }


    // Mail gönderme fonksiyonunu çağırıyoruz
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

    console.log("Günlük rapor başarıyla gönderildi.");
  } catch (err) {
    console.error("Rapor gönderme sırasında hata oluştu:", err);
  }
}

runDailyReport();

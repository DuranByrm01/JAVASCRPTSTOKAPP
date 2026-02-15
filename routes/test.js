const express = require("express");
const router = express.Router();

const db = require("../data/db");


// router.post('/certificate/search', async (req, res) => {
//     const { code } = req.body;

//     console.log("Aranan kod:", code);

//     try {
//         const [rows] = await db.execute(
//             `SELECT * FROM trc60_20pcs_box
//              WHERE trc60_20pcs_box_barkod = ?
//              OR trc60_cihaz_id_1  = ?
//              OR trc60_cihaz_id_2  = ?
//              OR trc60_cihaz_id_3  = ?
//              OR trc60_cihaz_id_4  = ?
//              OR trc60_cihaz_id_5  = ?
//              OR trc60_cihaz_id_6  = ?
//              OR trc60_cihaz_id_7  = ?
//              OR trc60_cihaz_id_8  = ?
//              OR trc60_cihaz_id_9  = ?
//              OR trc60_cihaz_id_10 = ?
//              OR trc60_cihaz_id_11 = ?
//              OR trc60_cihaz_id_12 = ?
//              OR trc60_cihaz_id_13 = ?
//              OR trc60_cihaz_id_14 = ?
//              OR trc60_cihaz_id_15 = ?
//              OR trc60_cihaz_id_16 = ?
//              OR trc60_cihaz_id_17 = ?
//              OR trc60_cihaz_id_18 = ?
//              OR trc60_cihaz_id_19 = ?
//              OR trc60_cihaz_id_20 = ?`,
//             Array(21).fill(code) // 1 barkod + 20 cihaz id
//         );

//         if (rows.length > 0) {
//             res.json({
//                 success: true,
//                 data: rows
//             });
//         } else {
//             res.json({
//                 success: false,
//                 message: "Kayıt bulunamadı"
//             });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: "Sunucu hatası" });
//     }
// });


router.post('/certificate/search', async (req, res) => {
    const { code } = req.body;
    console.log("Aranan kod:", code);

    // Her tablo için 1 barkod + 20 cihaz id olacak şekilde array
    const params = Array(21).fill(code);

    try {
        const queries = [
            `SELECT *, 'trc60_20pcs_box' AS source_table FROM trc60_20pcs_box
             WHERE trc60_20pcs_box_barkod = ?
             OR trc60_cihaz_id_1  = ?
             OR trc60_cihaz_id_2  = ?
             OR trc60_cihaz_id_3  = ?
             OR trc60_cihaz_id_4  = ?
             OR trc60_cihaz_id_5  = ?
             OR trc60_cihaz_id_6  = ?
             OR trc60_cihaz_id_7  = ?
             OR trc60_cihaz_id_8  = ?
             OR trc60_cihaz_id_9  = ?
             OR trc60_cihaz_id_10 = ?
             OR trc60_cihaz_id_11 = ?
             OR trc60_cihaz_id_12 = ?
             OR trc60_cihaz_id_13 = ?
             OR trc60_cihaz_id_14 = ?
             OR trc60_cihaz_id_15 = ?
             OR trc60_cihaz_id_16 = ?
             OR trc60_cihaz_id_17 = ?
             OR trc60_cihaz_id_18 = ?
             OR trc60_cihaz_id_19 = ?
             OR trc60_cihaz_id_20 = ?`,

            `SELECT *, 'trc01_20pcs_box' AS source_table FROM trc01_20pcs_box
             WHERE trc01_20pcs_box_barkod = ?
             OR trc01_cihaz_id_1  = ?
             OR trc01_cihaz_id_2  = ?
             OR trc01_cihaz_id_3  = ?
             OR trc01_cihaz_id_4  = ?
             OR trc01_cihaz_id_5  = ?
             OR trc01_cihaz_id_6  = ?
             OR trc01_cihaz_id_7  = ?
             OR trc01_cihaz_id_8  = ?
             OR trc01_cihaz_id_9  = ?
             OR trc01_cihaz_id_10 = ?
             OR trc01_cihaz_id_11 = ?
             OR trc01_cihaz_id_12 = ?
             OR trc01_cihaz_id_13 = ?
             OR trc01_cihaz_id_14 = ?
             OR trc01_cihaz_id_15 = ?
             OR trc01_cihaz_id_16 = ?
             OR trc01_cihaz_id_17 = ?
             OR trc01_cihaz_id_18 = ?
             OR trc01_cihaz_id_19 = ?
             OR trc01_cihaz_id_20 = ?`,

            `SELECT *, 'luvinka_20_box' AS source_table FROM luvinka_20_box
             WHERE luvinka_20_box_barkod = ?
             OR luvinka_cihaz_id_1  = ?
             OR luvinka_cihaz_id_2  = ?
             OR luvinka_cihaz_id_3  = ?
             OR luvinka_cihaz_id_4  = ?
             OR luvinka_cihaz_id_5  = ?
             OR luvinka_cihaz_id_6  = ?
             OR luvinka_cihaz_id_7  = ?
             OR luvinka_cihaz_id_8  = ?
             OR luvinka_cihaz_id_9  = ?
             OR luvinka_cihaz_id_10 = ?
             OR luvinka_cihaz_id_11 = ?
             OR luvinka_cihaz_id_12 = ?
             OR luvinka_cihaz_id_13 = ?
             OR luvinka_cihaz_id_14 = ?
             OR luvinka_cihaz_id_15 = ?
             OR luvinka_cihaz_id_16 = ?
             OR luvinka_cihaz_id_17 = ?
             OR luvinka_cihaz_id_18 = ?
             OR luvinka_cihaz_id_19 = ?
             OR luvinka_cihaz_id_20 = ?`
        ];

        // Her tablo için sorguyu çalıştır ve sonuçları birleştir
        const results = await Promise.all(queries.map(q => db.execute(q, params)));
        const mergedRows = results.flatMap(r => r[0]); // [rows, fields] => rows

        if (mergedRows.length > 0) {
            res.json({ success: true, data: mergedRows });
        } else {
            res.json({ success: false, message: "Kayıt bulunamadı" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Sunucu hatası" });
    }
});





module.exports = router;



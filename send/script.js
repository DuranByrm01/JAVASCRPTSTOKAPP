const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// MySQL bağlantısı
const db = mysql.createConnection({
    host: '35.256.125.5',
    user: 'duran',
    password: 'Db04112024',
    database: 'bilgiler'
});

db.connect((err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err);
        return;
    }
    console.log('Veritabanına başarıyla bağlandı');
});

// Veritabanından veri çekme
app.get('/fetchData', (req, res) => {
    const sql = 'SELECT CihazID, Sicaklik, Nem, Basinc FROM sensorBilgi';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Veri çekme hatası:', err);
            res.status(500).send('Veri çekme hatası');
            return;
        }
        res.json(results);
    });
});

// Statik dosyaları sunma
app.use(express.static('public'));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});

// const nodemailer = require('nodemailer');



// // Mail gönderme ayarları
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'duranb895@gmail.com',
//     pass: 'fted jwmw igmc bxsr', // Google uygulama şifresi
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });



// // 2. Mail içeriğini hazırla
// const mailOptions = {
//   from: "duranb895@gmail.com",
//   to: "bayramd693@gmail.com",
//   subject: "Merhaba!",
//   text: "bu nodemailer nasıl kullanılır çözemedim ",
// };

// // 3. Maili gönder
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     return console.log("Hata oluştu:", error);
//   }
//   console.log("E-posta gönderildi:", info.response);
// });

// // // Dışa aktar
// // module.exports = { sendEmail };


// const nodemailer = require("nodemailer");

// async function sendLowStockEmail(lowStockData) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'seninmail@gmail.com',
//             pass: 'uygulama şifresi'
//         }
//     });

//     const tableRows = lowStockData.map(item => `
//         <tr>
//             <td>${item.urun_malzeme_adi}</td>
//             <td>${item.urun_malzeme_adet}</td>
//             <td>${item.malzeme_id}</td>
//             <td>${item.checked}</td>
//         </tr>
//     `).join("");

//     const htmlContent = `
//         <h3>Stokta azalan ürünler</h3>
//         <table border="1" cellpadding="5" cellspacing="0">
//             <tr>
//                 <th>Ürün Malzeme Adı</th>
//                 <th>Adet</th>
//                 <th>Malzeme ID</th>
//                 <th>Checked</th>
//             </tr>
//             ${tableRows}
//         </table>
//     `;

//     const mailOptions = {
//         from: 'seninmail@gmail.com',
//         to: 'alicimail@gmail.com',
//         subject: 'Düşük Stok Bildirimi',
//         html: htmlContent
//     };

//     await transporter.sendMail(mailOptions);
// }

// module.exports = sendLowStockEmail;

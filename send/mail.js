
const db = require("../data/db"); 

const nodemailer = require("nodemailer");




//////////////mail///////////////////////

async function sendLowStockEmail(lowStockData,gzc24mailRows,trc60MailRows,trc01MailRows,luvinkaMailRows,casusmailRows,etilenSivimailRows,etilenJeneratorMailRows) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // örnek: Gmail kullanıyorsan
        auth: {
            user: 'duranb895@gmail.com',
            pass: 'fted jwmw igmc bxsr'  // Gmail için uygulama şifresi kullan
        },
        
        tls: {
            rejectUnauthorized: false,
        },

    });

    console.log("mail gönderildi");

    let stockTable = "";

    if (lowStockData.length > 0) {
         // lowStock verisini HTML tabloya dönüştür
        const tableRows = lowStockData.map(item => `
            <tr>
                <td>${item.urun_malzeme_adi}</td>
                <td>${item.urun_malzeme_adet}</td>
                <td>${item.malzeme_id}</td>
                <td>${item.checked}</td>
            </tr>
        `).join("");

        stockTable += `
             <h3>Stokta azalan ürünler</h3>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>Adet</th>
                    <th>Malzeme ID</th>
                    <th>Checked</th>
                </tr>
                ${tableRows}
                
            </table>    

        
        `;


    }

   
    let gzc24list = "";

    if (gzc24mailRows.length > 0) {
           // gzc24rows verisini HTML tabloya dönüştür
        const gzc24rows = gzc24mailRows.map(item => `
            <tr>
                <td>GZC24 GOLD</td>
                <td>${item.gzc24_kutu_sayisi}</td>
                <td>${item.gzc24_uretim_adet}</td>
                <td>${item.gzc24_uretim_day}</td>
                <td>${item.gzc24_uretim_date}</td>
            </tr>
        `).join("");

        gzc24list +=`
            
             <h3>BU GÜN ÜRETİLEN MALZEMELER</h3>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>Kutu sayısı</th>
                    <th>Adet</th>
                    <th>Malzeme GÜN</th>
                    <th>TARİH</th>
                </tr>
                ${gzc24rows}
                
            </table>


        `;



    }
   

    let trc60list = "";

    if (trc60MailRows.length > 0) {
             // trc60rows verisini HTML tabloya dönüştür
        const trc60rows = trc60MailRows.map(item => `
            <tr>
                <td>TRC60</td>
                <td>${item.TRC60_20PCS_BOX_LIST_BARKOD}</td>
                <td>${item.TRC60_20PCS_BOX_LIST_date}</td>
                
            </tr>
        `).join("");

        trc60list += `
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>Kutu Barkod</th>
                    <th>Tarih</th>
                </tr>
                ${trc60rows}
            </table><br>
        `;

        
    }

    let trc01list = "";

    if (trc01MailRows.length > 0) {
              // trc01rows verisini HTML tabloya dönüştür
        const trc01rows = trc01MailRows.map(item => `
            <tr>
                <td>TRC01</td>
                <td>${item.trc01_20pcs_box_list_barkod}</td>
                <td>${item.trc01_20pcs_box_list_date}</td>
                
            </tr>
        `).join("");

        trc01list = `
            <table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Ürün Malzeme Adı</th>
                <th>Kutu Barkod</th>
                <th>Tarih</th>
                
            </tr>
            ${trc01rows}
            
            </table>

        `;



    }
   
    let luvinkalist = "";

    if (luvinkaMailRows.length > 0) {
                // luvinkaMail verisini HTML tabloya dönüştür
        const luvinkaMail = luvinkaMailRows.map(item => `
            <tr>
                <td>LUVİNKA</td>
                <td>${item.luvinka_20_box_list_barkod}</td>
                <td>${item.luvinka_20_box_list_date}</td>
                
            </tr>
        `).join("");

        luvinkalist += `
             <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>Kutu Barkod</th>
                    <th>Tarih</th>
                    
                </tr>
                ${luvinkaMail}
                
            </table>
        
        `;


    }

    let casuslist = "";
    if (casusmailRows.length > 0) {
                 // casusMail verisini HTML tabloya dönüştür
        const casusMail = casusmailRows.map(item => `
            <tr>
                <td>CASUS</td>
                <td>${item.casus_uretim_kutu_adet}</td>
                <td>${item.casus_uretim_adet}</td>
                <td>${item.casus_uretim_day}</td>
                <td>${item.casus_uretim_date}</td>
                
            </tr>
        `).join("");

        casuslist +=`
              <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>Kutu sayısı</th>
                    <th>Adet</th>
                    <th>Malzeme GÜN</th>
                    <th>TARİH</th>
                </tr>
                ${casusMail}
                
            </table>
            
        
        `;
    }

      let etilensıvılist = "";
    if (etilenSivimailRows.length > 0) {
               // EtilenSiviMail verisini HTML tabloya dönüştür
        const EtilenSiviMail = etilenSivimailRows.map(item => `
            <tr>
                <td>ETİLEN SIVI</td>
                <td>${item.etilen_uretim_kutu}</td>
                <td>${item.etilen_uretim_adet}</td>
                <td>${item.etilen_uretim_tarih}</td>
            
                
            </tr>
        `).join("");

        etilensıvılist +=`
              <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>Kutu Sayısı</th>
                    <th>Adet</th>
                    <th>Tarih</th>
                    
                </tr>
                ${EtilenSiviMail}
                
            </table>
            
        
        `;
    }

      
    let etilenjeneratorlist = "";

    if (etilenJeneratorMailRows.length > 0) {
                       // EtilenjeneratorMail verisini HTML tabloya dönüştür
        const EtilenjeneratorMail = etilenJeneratorMailRows.map(item => `
            <tr>
                <td>ETİLEN JENERATÖR</td>
                <td>${item.etilen_jenerator_adet}</td>
                <td>${item.etilen_jenerator_date}</td>
                
            </tr>
        `).join("");

        etilenjeneratorlist +=`
             <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Ürün Malzeme Adı</th>
                    <th>ÜRÜN ADET</th>
                    <th>Tarih</th>
                    
                </tr>
                ${EtilenjeneratorMail}
                
            </table>
            

        `;

    }
 


    const htmlContent = `

        ${trc60list}
        <br> 
        ${trc01list}   
        <br>
        ${gzc24list}
        <br>
        ${luvinkalist}
        <br>
        ${casuslist}
        <br>
        ${etilensıvılist}
        <br>
        ${etilenjeneratorlist}
        <br>
        ${stockTable}
        
        
       
    `;

   
    
   

    const mailOptions = {
        from: 'duranb895@gmail.com',
        to: 'bayramd693@gmail.com, callcod9@gmail.com',
        subject: 'GÜNLÜK STOK BİLDİRİMİ v2',
        html: htmlContent
    };

  

    await transporter.sendMail(mailOptions);
}

/////////////////////////////////////

module.exports = sendLowStockEmail;

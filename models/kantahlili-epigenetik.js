const mongoose = require('mongoose');


// Kan Tahlili Şeması
const KanTahliliSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    tarih: { type: Date, default: Date.now },
    parametre: { type: String, required: true },
    sonuc: { type: String, required: true }
  });
  
  // Epigenetik Sonuç Şeması
  const EpigenetikSonucSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    tarih: { type: Date, default: Date.now },
    parametre: { type: String, required: true },
    sonuc: { type: String, required: true }
  });



const KanTahlili = mongoose.model('KanTahlili', KanTahliliSchema);
const EpigenetikSonuc = mongoose.model('EpigenetikSonuc', EpigenetikSonucSchema);
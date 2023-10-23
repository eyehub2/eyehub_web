const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// İstek gövdelerini JSON formatında ayrıştır
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('css'));

app.use(session({
  secret: 'gizli-bir-anahtar', // Oturum verilerinin güvenliği için kullanılan gizli bir anahtar
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // EJS veya tercih ettiğiniz başka bir görünüm motorunu kullanabilirsiniz

// // CORS mediumware'i ekleyin
app.use(cors());
const port = 3300;

const mongoose = require('mongoose');
const User = require("./mongodb-connection");
// const Agent = require('./models/agent');
//eyehub password = lZ3tuScjEVAunj91
//admin password = MHr1lXg8uJM2rTIW
//ESKİ LİNK = mongodb+srv://eyehub:lZ3tuScjEVAunj91@eyehub.axor47n.mongodb.net/?retryWrites=true&w=majority
//ilk link = mongodb+srv://admin:Kayseri2020@atbprod.3ok1v.mongodb.net/agentdatabase?authSource=admin&replicaSet=atlas-vzi623-shard-0&readPreference=primary&ssl=true
mongoose.connect('mongodb+srv://admin:MHr1lXg8uJM2rTIW@userinfo.sriqujw.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB bağlantısı başarılı.');
  })
  .catch((err) => {
    console.error('MongoDB bağlantısı hatası: ' + err);
  });
  
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    if('OPTIONS' == req.method) res.sendStatus(200);
    else next();
  });
  
// Giriş sayfası
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});
//Kayıt ol sayfası
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});


//Kayıt işlemi, kullanıcıyı kaydedip bilgilerini database'e atar. 
//Kayıt ettikten sonra kullanıcı otomatik olarak giriş yap sayfasına yönlendirilir ve giriş yapması istenir.  
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Kullanıcıyı kaydet
  const newUser = new User({ username, password });
  //şifre boş bırakıldıysa oto olarak 123456 yapıyor. NOT:bunu otomatik olarak mongo-connection.js'nin yapmalı 
  if (newUser.password==""){
    newUser.password="123456";
  }

  try {
    await newUser.save();
    console.log('User added to the database');
    res.redirect('/login');
  } catch (err) {
    console.error('Error adding user to the database:', err);
    res.status(500).json({ error: 'Error adding user to the database' });
    return;
  }
});

//Giriş işlemi
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Kullanıcıyı giriş yap
  try {
    const user = await User.findOne({ username, password });

    if (user) {
      req.session.userId = user.username;
      console.log("Kullanıcı bulundu ve giriş yapıldı");
      //res.status(200).json({ message: 'User added to the database and logged in' });
    } else {
      console.log('Kullanıcı bulunamadı');
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ error: 'MongoDB Error: ' + error.message });
  }
});


//Şuanlık kullanmıyoruz
// app.get('/allagents', async (req, res) => {
//   const userId = req.session.userId;
//   if (userId) {
//   try {
//     console.log(userId);

//     const agents = await Agent.find({ parentAgentName: userId });
//     res.render('allagents', { agents: agents });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Veritabanı hatası');
//   }
// }
//  else {
//   res.redirect('/login');
// }
// });


 

// app.get('/agentcrud_find_update', (req, res) => {
//   const userId = req.session.userId; // Oturum açıkken oturum verisinden kullanıcı kimliğini çek
//   if (userId) {
//     res.render('agentcrud_find_update', { userId });
//   } else {
//     res.redirect('/login');
//   }
// });

// app.get('/agentcrud_add', (req, res) => {
//   const userId = req.session.userId; // Oturum açıkken oturum verisinden kullanıcı kimliğini çek
//   if (userId) {
//     res.render('agentcrud_add', { userId });
//   } else {
//     res.redirect('/login');
//   }
// });

// app.get('/script_add', (req, res) => {
//   const userId = req.session.userId; // Oturum açıkken oturum verisinden kullanıcı kimliğini çek
//   if (userId) {
//     res.sendFile(__dirname + '/js/script_add.js');
//   } else {
//     res.redirect('/login');
//   }
// });

// app.get('/script_find_update', (req, res) => {
//   const userId = req.session.userId; // Oturum açıkken oturum verisinden kullanıcı kimliğini çek
//   if (userId) {
//     res.sendFile(__dirname + '/js/script_find_update.js');
//   } else {
//     res.redirect('/login');
//   }
// });


//   app.get('/agents/:id', async (req, res) => {
//     try {
//       console.log(req.params.id);
//       const agent = await Agent.findOne({ agentUserName: req.params.id });
//       if (!agent) {
//         return res.status(404).send('Ajan bulunamadı.');
//       }
//       res.json(agent);
//     } catch (error) {
//       res.status(500).send('Ajanı getirme hatası: ' + error);
//     }
// });


//   app.get('/agents', async (req, res) => {
//     try {
//       const agents = await Agent.find();
//       res.json(agents);
//     } catch (error) {
//       res.status(500).send('Ajanları getirme hatası: ' + error);
//     }
//   });

// app.post('/agents', async (req, res) => {
// // Ajan Ekleme (Insert)
// try {
//   console.log(req.body)
//   const agentData = req.body; // İstemci tarafından gönderilen JSON verisi
//   const newAgent = new Agent(agentData); // Yeni bir ajan nesnesi oluştur
//   const savedAgent = newAgent.save(); // Ajanı veritabanına kaydet
//   res.json(savedAgent); // Kaydedilen ajanı JSON formatında yanıtla
// } catch (error) {
//   res.status(400).send(error); // Hata durumunda hata mesajını yanıtla
// }
// });

// app.put('/agents/:id', async (req, res) => {
//   try {
//     console.log(req.body)
//     console.log(req.params.id)
//     const targetagentName = req.params.id;
//     const updatedData = req.body;

//     Agent.updateMany({ agentUserName: targetagentName }, {
//       agentType: updatedData.agentType,
//       agentPassword: updatedData.agentPassword,
//       // agentTCKN: updatedData.agentTCKN,
//       // agentAddress: updatedData.agentAddress,
//       // agentPhone: updatedData.agentPhone,
//       // agentEmail: updatedData.agentEmail,
//       // agentIBAN: updatedData.agentIBAN,
//       // agentTotalSalesAmount: updatedData.agentTotalSalesAmount,
//       // totalEarnedFromNetwork: updatedData.totalEarnedFromNetwork,
//       // totalDirectSalesAmount: updatedData.totalDirectSalesAmount,
//       // totalAmountPaid: updatedData.totalAmountPaid,
//       // totalRemainingAmount: updatedData.totalRemainingAmount,
//       // totalExpenditure: updatedData.totalExpenditure,
//       // commissionPercentage: updatedData.commissionPercentage,
//       // parentAgentName: updatedData.parentAgentName
//     }, (error, result) => {
//       if (error) {
//         console.error('Güncelleme hatası: ' + error);
//       } else {
//         console.log('Güncellenen belge sayısı: ' + result.nModified);
//       }
//     });
    
//     res.json(updatedData);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// Oturumu sonlandır
app.get('/logout', (req, res) => {
  req.session.destroy();
  console.log("Kullancı çıkış yaptı");
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

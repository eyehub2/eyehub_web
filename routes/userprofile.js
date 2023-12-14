const User = require('../models/user-profile');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const UserActivity = require('../models/user-activity');
const storyActivity = require('../models/storyschema');



// const Agent = require('./models/agent');
//eyehub password = lZ3tuScjEVAunj91
//admin password = MHr1lXg8uJM2rTIW
//ESKİ LİNK = mongodb+srv://eyehub:lZ3tuScjEVAunj91@eyehub.axor47n.mongodb.net/?retryWrites=true&w=majority
//ilk link = mongodb+srv://admin:Kayseri2020@atbprod.3ok1v.mongodb.net/agentdatabase?authSource=admin&replicaSet=atlas-vzi623-shard-0&readPreference=primary&ssl=true
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//mongo bağlantısı
mongoose.connect('mongodb+srv://admin:MHr1lXg8uJM2rTIW@userinfo.sriqujw.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB bağlantısı user-profile için başarılı.');
  })
  .catch((err) => {
    console.error('MongoDB bağlantısı user-profile hatası: ' + err);
  });
  
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    if('OPTIONS' == req.method) res.sendStatus(200);
    else next();
  });

// İstek gövdelerini JSON formatında ayrıştır
app.use(express.json());
app.use(express.static('css'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'gizli-bir-anahtar', // Oturum verilerinin güvenliği için kullanılan gizli bir anahtar
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

// // CORS mediumware'i ekleyin
app.use(cors());


// Giriş sayfası
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});
//Kayıt ol sayfası
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
});
//Şifre yenileme sayfası 
app.get('/forget-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/forget-password.html'));
});
app.get('/updateData',(req,res)=>{
  res.sendFile(path.join(__dirname,'/../views/updateData.html'));
});
  


//Kayıt işlemi, kullanıcıyı kaydedip bilgilerini database'e atar. 
//Kayıt ettikten sonra kullanıcı otomatik olarak giriş yap sayfasına yönlendirilir ve giriş yapması istenir.  
app.post('/register', async (req, res) => {
  const { username, password, email,birthday, gender, location } = req.body;

  // Kullanıcıyı kaydet
  const newUser = new User({ username, password,email, birthday, gender, location });
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



// Yeni şifre sıfırlama işlemini gerçekleştir
app.post('/forget-password', async (req, res) => {
  const { email, username, newPassword, confirmNewPassword } = req.body;

  // Yeni şifre ile tekrar girilen şifrenin uyuşup uyuşmadığını kontrol edin
  if (newPassword !== confirmNewPassword) {
      return res.status(400).send('Yeni şifreler uyuşmuyor');
  }

  // E-posta, kullanıcı adı ve yeni şifre ile kullanıcıyı bulup şifresini güncelleyin
  try {
      const user = await User.findOne({ email, username });
      if (!user) {
          return res.status(404).send('Kullanıcı bulunamadı');
      }

      // Kullanıcının şifresini güncelleyin
      user.password = newPassword;
      await user.save();

      res.send('Şifreniz başarıyla sıfırlandı.');
  } catch (error) {
      console.error(error);
      res.status(500).send('Şifre sıfırlama hatası: ' + error.message);
  }
});
app.post('/updateData', async (req, res) => {
  const { _id, email, username, birthday, gender, location } = req.body;

  try {
    // Belirtilen _id'ye sahip kullanıcıyı bul
    const user = await User.findByIdAndUpdate(
      _id,
      { email, username, birthday, gender, location },
      { new: true } // Güncellenmiş belgeyi döndürmek için
    );
    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı');
    }
    res.send('Kullanıcı verileri başarıyla güncellendi.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Kullanıcı verilerini güncelleme hatası: ' + error.message);
  }
});
app.post('/updateData', async (req, res) => {
  res.send("çalışıyor.")
});
// Assuming you have already defined your User model and required necessary modules

app.post('/cancelSubscription', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { subscription_end_date: new Date() }, // Set subscription_end_date to the current date
      { new: true }
    );

    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı');
    }

    res.send('Abonelik iptali başarıyla gerçekleşti.');
  } catch (error) {
    console.error('Abonelik iptali hatası:', error);
    res.status(500).send('Abonelik iptali hatası: ' + error.message);
  }
});
app.post('/extendSubscription', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      
      { subscription_start_date: new Date()}, // Set subscription_end_date to the current date
      { new: true }
    );

    if (!user) {
      return res.status(404).send('Kullanıcı bulunamadı');
    }
    console.log('Abonelik başarıyla uzatıldı.');
    res.send('Abonelik başarıyla uzatıldı.');
    
  } catch (error) {
    console.error('Abonelik uzatılamadı:', error);
    res.status(500).send('Abonelik uzatılamadı: ' + error.message);
  }
});



app.get('/logout', (req, res) => {
  req.session.destroy();
  console.log("Kullancı çıkış yaptı");
  res.redirect('/login');
});

// Create a new user activity
app.post('/api/user-activity', async (req, res) => {
  try {
    const newUserActivity = new UserActivity(req.body);
    const savedUserActivity = await newUserActivity.save();
    res.json(savedUserActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all user activities
app.get('/api/user-activity', async (req, res) => {
  try {
    const userActivities = await UserActivity.find();
    //res.json(userActivities);
   res.send("çalıştı");
    console.log("whatsup riri?");
    //res.redirect('/api/story');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user activity by ID
app.get('/api/user-activity/:id', async (req, res) => {
  try {
    const userActivity = await UserActivity.findById(req.params.id);
    if (!userActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    res.json(userActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific user activity by ID
app.put('/api/user-activity/:id', async (req, res) => {
  try {
    const updatedUserActivity = await UserActivity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUserActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    res.json(updatedUserActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a specific user activity by ID
app.delete('/api/user-activity/:id', async (req, res) => {
  try {
    const deletedUserActivity = await UserActivity.findByIdAndDelete(
      req.params.id
    );
    if (!deletedUserActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    res.json(deletedUserActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/story', async (req, res) => {
  try {
    const newstoryActivity = new storyActivity(req.body);
    const savedstoryActivity = await newstoryActivity.save();
    res.json(savedstoryActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all user activities
app.get('/api/story', async (req, res) => {
  try {
    const storyActivities = await storyActivity.find();
    //res.json(storyActivities);
    console.log("çalıştı");
     res.send("yessir");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user activity by ID
app.get('/api/story/:id', async (req, res) => {
  try {
    const storyActivity = await storyActivity.findById(req.params.id);
    if (!storyActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    res.json(storyActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific user activity by ID
app.put('/api/story/:id', async (req, res) => {
  try {
    const updatedstoryActivity = await storyActivity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedstoryActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    res.json(updatedstoryActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a specific user activity by ID
app.delete('/api/story/:id', async (req, res) => {
  try {
    const deletedstoryActivity = await storyActivity.findByIdAndDelete(
      req.params.id
    );
    if (!deletedstoryActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    res.json(deletedstoryActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = app;


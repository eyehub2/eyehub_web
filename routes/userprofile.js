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

  try {
    const user = await User.findOne({ username, password });

    if (user) {
      // MongoDB'den gelen kullanıcı verilerini JSON formatında oluştur
      const userJson = {
        username: user.username,
        gender: user.gender,
        birthday: user.birthday,
        location: user.location,
        subscription_start_date: user.subscriptionStartDate,
        subscription_end_date: user.subscriptionEndDate,
        email: user.email,
      };

      // Tarayıcıya JSON response gönder
      res.status(200).json({
        success: true,
        data: userJson,
        error: null
      });

      req.session.userId = user.username; // Oturum açıldığında kullanıcı kimliğini sakla

    } else {
      console.log('Kullanıcı bulunamadı');
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ error: 'MongoDB Error: ' + error.message });
  }
});

app.get('/get-user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // ObjectID kontrolü
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, data: null, error: 'Geçersiz ObjectID' });
    }

    const user = await User.findById(userId);

    if (user) {
      res.status(200).json({
        success: true,
        data: user,
        error: null
      });
    } else {
      res.status(404).json({ success: false, data: null, error: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ success: false, data: null, error: 'MongoDB Error: ' + error.message });
  }
});

// Yeni şifre sıfırlama işlemini gerçekleştir
app.post('/forget-password', async (req, res) => {
  const { email, username, newPassword, confirmNewPassword } = req.body;

  // Yeni şifre ile tekrar girilen şifrenin uyuşup uyuşmadığını kontrol edin
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ success: false, error: 'Yeni şifreler uyuşmuyor' });
  }

  try {
    // Kullanıcıyı bulup şifresini güncelle
    const user = await User.findOne({ email, username });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının şifresini güncelle
    user.password = newPassword;
    await user.save();

    // Kullanıcının tüm bilgilerini bir JSON nesnesi olarak oluştur
    const userJson = {
      username: user.username,
      gender: user.gender,
      birthday: user.birthday,
      location: user.location,
      subscription_start_date: user.subscriptionStartDate,
      subscription_end_date: user.subscriptionEndDate,
      email: user.email,
    };

    // JSON response gönder
    res.status(200).json({
      success: true,
      data: userJson,
      message: 'Şifreniz başarıyla sıfırlandı.',
      error: null,
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({ success: false, error: 'Şifre sıfırlama hatası: ' + error.message });
  }
});
app.post('/updateData', async (req, res) => {
  const { _id, email, username, birthday, gender, location } = req.body;

  try {
    // Belirtilen _id'ye sahip kullanıcıyı bul ve güncelle
    const user = await User.findByIdAndUpdate(
        _id,
        { email, username, birthday, gender, location },
        { new: true } // Güncellenmiş belgeyi döndürmek için
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Güncellenmiş kullanıcı bilgilerini bir JSON nesnesi olarak oluştur
    const updatedUserJson = {
      username: user.username,
      gender: user.gender,
      birthday: user.birthday,
      location: user.location,
      subscription_start_date: user.subscriptionStartDate,
      subscription_end_date: user.subscriptionEndDate,
      email: user.email,
    };

    // JSON response gönder
    res.status(200).json({
      success: true,
      data: updatedUserJson,
      message: 'Kullanıcı verileri başarıyla güncellendi.',
      error: null,
    });
  } catch (error) {
    console.error('Kullanıcı verilerini güncelleme hatası:', error);
    res.status(500).json({ success: false, error: 'Kullanıcı verilerini güncelleme hatası: ' + error.message });
  }
});
app.post('/updateData', async (req, res) => {
  res.send("çalışıyor.")
});
// Assuming you have already defined your User model and required necessary modules
const { ObjectId } = require('mongodb');

app.post('/cancelSubscription', async (req, res) => {
  const { userId } = req.body;

  try {
    // Belirtilen userId'ye sahip kullanıcıyı bul ve abonelik bilgilerini güncelle
    const user = await User.findByIdAndUpdate(
        userId,
        { subscription_end_date: new Date() },
        { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Güncellenmiş abonelik bilgilerini bir JSON nesnesi olarak oluştur
    const updatedSubscriptionJson = {
      username: user.username,
      subscription_start_date: user.subscriptionStartDate,
      subscription_end_date: user.subscriptionEndDate,
    };

    // JSON response gönder
    res.status(200).json({
      success: true,
      data: updatedSubscriptionJson,
      message: 'Abonelik iptali başarıyla gerçekleşti.',
      error: null,
    });
  } catch (error) {
    console.error('Abonelik iptali hatası:', error);
    res.status(500).json({ success: false, error: 'Abonelik iptali hatası: ' + error.message });
  }
});

app.post('/extendSubscription', async (req, res) => {
  const { userId } = req.body;

  try {
    // Belirtilen userId'ye sahip kullanıcıyı bul ve abonelik bilgilerini güncelle
    const user = await User.findByIdAndUpdate(
        userId,
        { subscription_start_date: new Date() },
        { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Güncellenmiş abonelik bilgilerini bir JSON nesnesi olarak oluştur
    const updatedSubscriptionJson = {
      username: user.username,
      subscription_start_date: user.subscriptionStartDate,
      subscription_end_date: user.subscriptionEndDate,
    };

    // JSON response gönder
    res.status(200).json({
      success: true,
      data: updatedSubscriptionJson,
      message: 'Abonelik başarıyla uzatıldı.',
      error: null,
    });
  } catch (error) {
    console.error('Abonelik uzatılamadı:', error);
    res.status(500).json({ success: false, error: 'Abonelik uzatılamadı: ' + error.message });
  }
});
app.get('/logout', async (req, res) => {
  try {
    // Özel bir MongoDB sorgusu ile kullanıcı verilerini çekme (örneğin, kullanıcı ID'sine göre)
    const userId = req.session.userId; // Kullanıcı ID'si önceden oturumda saklanmış olmalı
    const user = await User.findById(userId);

    if (!user) {
      console.error('Kullanıcı bulunamadı');
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Oturumu sonlandır
    req.session.destroy();
    console.log('Kullanıcı çıkış yaptı');

    // Kullanıcı bilgilerini JSON response gönder
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        birthday: user.birthday,
        gender: user.gender,
        location: user.location,
        subscription_start_date: user.subscriptionStartDate,
        subscription_end_date: user.subscriptionEndDate,
        // ... Diğer kullanıcı bilgileri
      },
      message: 'Kullanıcı çıkış yaptı.',
      error: null,
    });
  } catch (error) {
    console.error('Logout hatası:', error);
    res.status(500).json({ success: false, error: 'Logout hatası: ' + error.message });
  }
});


// Create a new user activity
app.post('/api/user-activity', async (req, res) => {
  try {
    const newUserActivity = new UserActivity(req.body);
    const savedUserActivity = await newUserActivity.save();

    // Oluşturulan kullanıcı aktivitesinin tüm bilgilerini JSON formatında gönder
    res.json({
      success: true,
      data: savedUserActivity,
      error: null
    });

  } catch (error) {
    res.status(400).json({ success: false, data: null, error: error.message });
  }
});

// Get all user activities
app.get('/api/user-activity', async (req, res) => {
  try {
    const userActivities = await UserActivity.find();
    //   //res.json(userActivities);
    //  res.send("çalıştı");
    //   console.log("whatsup riri?");
    //   //res.redirect('/api/story');
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
    // Tüm kullanıcı aktivitelerinin tüm bilgilerini JSON formatında gönder
    res.json({
      success: true,
      data: userActivities,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
  }
});

// Get a specific user activity by ID
app.get('/api/user-activity/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Geçersiz ObjectID' });
    }
    const userActivity = await UserActivity.findById(req.params.id);
    if (!userActivity) {
      return res.status(404).json({ error: 'User activity not found' });
    }
    //   res.json(userActivity);
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
    // Kullanıcı aktivitesinin tüm bilgilerini JSON formatında gönder
    res.json({
      success: true,
      data: userActivity,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
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
    //   res.json(updatedUserActivity);
    // } catch (error) {
    //   res.status(400).json({ error: error.message });
    // }
    // Güncellenen kullanıcı aktivitesinin tüm bilgilerini JSON formatında gönder
    res.json({
      success: true,
      data: updatedUserActivity,
      error: null
    });

  } catch (error) {
    res.status(400).json({ success: false, data: null, error: error.message });
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
    //   res.json(deletedUserActivity);
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
    res.json({
      success: true,
      data: deletedUserActivity,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
  }
});


app.post('/api/story', async (req, res) => {
  try {
    const newStoryActivity = new StoryActivity(req.body);
    const savedStoryActivity = await newStoryActivity.save();

    // Oluşturulan hikaye aktivitesinin tüm bilgilerini JSON formatında gönder
    res.json({
      success: true,
      data: savedStoryActivity,
      error: null
    });

  } catch (error) {
    res.status(400).json({ success: false, data: null, error: error.message });
  }
});

// Get all user activities
app.get('/api/story', async (req, res) => {
  try {
    const storyActivities = await storyActivity.find();
    //res.json(storyActivities);
    console.log("Calışıyor.");
    res.json({
      success: true,
      data: storyActivities,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
  }
});

// Get a specific user activity by ID
app.get('/api/story/:id', async (req, res) => {
  try {
    // ObjectID kontrolü
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Geçersiz ObjectID' });
    }

    const storyActivity = await StoryActivity.findById(req.params.id);

    if (!storyActivity) {
      return res.status(404).json({ error: 'Hikaye aktivitesi bulunamadı' });
    }

    // Hikaye aktivitesinin tüm bilgilerini JSON formatında gönder
    res.json({
      success: true,
      data: storyActivity,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
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
    //   res.json(updatedstoryActivity);
    // } catch (error) {
    //   res.status(400).json({ error: error.message });
    // }
    res.json({
      success: true,
      data: updatedStoryActivity,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
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
    //   res.json(deletedstoryActivity);
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
    res.json({
      success: true,
      data: deletedstoryActivity,
      error: null
    });

  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message });
  }
});

module.exports = app;
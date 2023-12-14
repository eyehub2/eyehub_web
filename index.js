const express = require('express');
const userProfileRouter = require('./routes/userprofile');
// const userActivityRouter = require('./routes/useractivity');

const app = express();//user profile
// const router = express();//user activity
// const routerStory = express();//story router



// Use the userActivityRouter for the /api/user-activity path
//router.use('/', userActivityRouter);
// routerStory.use('/', storyActivityRouter);
app.use('/', userProfileRouter);

const port = 3300;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Other middleware and configurations...
const PORT = 4000;
// router.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//  });

// routerStory.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
  
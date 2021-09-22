//==> REQUIRING NODE MODULES
const fs = require('fs');

//==> REQUIRING DEPENDENCIES
const mongoose = require('mongoose');

//==> REQUIRING ENVIRONMENT VARIABLES
const dotenv = require('dotenv');

//==> REQUIRING OUR MODULES
const Tour = require('../../model/tourModel');
const Review = require('../../model/reviewModel');
const User = require('../../model/userModel');

dotenv.config({ path: './config.env' });

//==> CONNECTING TO THE DATABASE
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('DB Connection successful!'));

//--> READ FILES
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

setTimeout(() => {
  //--> IMPORTING DATA INTO THE DATABASE
  const importData = async () => {
    try {
      await Tour.create(tours);
      await User.create(users, { validateBeforeSave: false });
      await Review.create(reviews);

      console.log('Data successfully loaded');
    } catch (err) {
      console.log(err);
    }

    process.exit();
  };

  //--> DELETING DATA FROM THE COLLECTIONS
  const deleteData = async () => {
    try {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();

      console.log('Data successfully deleted');
    } catch (err) {
      console.log(err);
    }

    process.exit();
  };

  if (process.argv[2] === '--import') {
    importData();
  } else if (process.argv[2] === '--delete') {
    deleteData();
  }
}, 10000);

//==> Requiring Dependencies
const mongoose = require('mongoose');

//==> Requiring environment variables
const dotenv = require('dotenv');

//==> CATCHING UNCAUGHT EXCEPTION ERRORS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 🔥  SHUTTING DOWN...');
  console.log(err, err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

//==> Connecting the Database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('DB Connection successful!'));

//==> Starting the server
const port = process.env.port;
const server = app.listen(port, () => {
  console.log(`App running on port: ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 🔥  SHUTTING DOWN...');
  console.log(err.name, err.message, err);

  server.close(() => {
    process.exit(1);
  });
});

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const morgan = require('morgan');
// const connectDB = require('./config/db');
const cors = require('cors');


const app = express();

require('dotenv/config');
mongoose.connect(process.env.connection, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', (err) => {
  console.log(err);
});
db.once('open', () => {
  console.log('Database connection established');
});


// Initialize Middleware
app.use(morgan('dev'));
// app.use(express.json({extended:true}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cors());
app.get('/',(req,res) => res.send('API Running'))

// Define Routes
app.use(require('./routes/user'));
app.use(require('./routes/auth'));
app.use(require('./routes/profile'));
app.use(require('./routes/post'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();


const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const corsOptions = require('./config/cors');

const app = express();


connectDB();


app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/v1/asset-categories', require('./routes/assetCategories'));
app.use('/api/v1/asset-subcategories', require('./routes/assetSubcategories'));
app.use('/api/v1/branches', require('./routes/branches'));
app.use('/api/v1/vendors', require('./routes/vendor'));
app.use('/api/v1/manufacturers', require('./routes/manufacturers'));
app.use('/api/v1/grns', require('./routes/grn'));


app.use(errorHandler);


app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
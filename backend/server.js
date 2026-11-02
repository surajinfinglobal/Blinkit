const express= require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const addressRoutes = require('./routes/address');
require('dotenv').config({ path: path.join(__dirname, '.env') })
const authRoutes = require(path.join(__dirname, 'routes', 'authRoutes'))


const app = express()
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
)
app.use(express.json())
app.get('/', (req, res) => {
  res.json({ message: 'Blinkit API is running!' })
})

// Protected user routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api', addressRoutes);
app.use("/api", require("./routes/distance"));
app.use("/api", require("./routes/orderRoutes"));

app.use('/api/auth', authRoutes)
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connected successfully')

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}
startServer()
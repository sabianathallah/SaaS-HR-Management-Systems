const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const router = require('./routes')
const { setupCronJobs } = require('./scheduler/cronJobs') // Uncomment to enable auto set absent
const path = require('path')

// Trust proxy - untuk mendapatkan IP address asli dari behind proxy/load balancer
// Ini penting untuk audit log agar req.ip bisa mendapatkan client IP yang benar
app.set('trust proxy', true)

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended : false}))

// Serve static files untuk attendance photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(router)

// Setup cron jobs for auto set absent
// Uncomment the line below to enable automatic absent marking
// Only run cron jobs if not in test environment
if (process.env.NODE_ENV !== 'test') {
  setupCronJobs()
}


module.exports = app
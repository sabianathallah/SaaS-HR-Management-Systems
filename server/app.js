const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const router = require('./routes')
const { setupCronJobs } = require('./scheduler/cronJobs') // Uncomment to enable auto set absent
const path = require('path')

// Trust proxy - trust 1 hop (e.g. nginx/cloudflare in front of the server)
// Using 1 instead of true to prevent IP spoofing via X-Forwarded-For header
app.set('trust proxy', 1)

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3005'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}))

// Limit request body size to prevent payload attacks
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))

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
const express = require('express')
const app = express()
const port = 3000
const router = require('./routes')
const { setupCronJobs } = require('./scheduler/cronJobs') // Uncomment to enable auto set absent
const path = require('path')

// Trust proxy - untuk mendapatkan IP address asli dari behind proxy/load balancer
// Ini penting untuk audit log agar req.ip bisa mendapatkan client IP yang benar
app.set('trust proxy', true)

app.use(express.json())
app.use(express.urlencoded({extended : false}))

// Serve static files untuk attendance photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(router)

// Setup cron jobs for auto set absent
// Uncomment the line below to enable automatic absent marking
setupCronJobs()

// app.listen(port, () => {
//   console.log(`running on port http://localhost:${port}`)
// })

module.exports = app
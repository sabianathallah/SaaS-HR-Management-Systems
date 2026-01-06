# 📍 IP ADDRESS TRACKING - GUIDE

## 🎯 Dari Mana IP Address Didapatkan?

IP address dalam Audit Log System didapatkan dari **Express request object** dengan multiple fallback mechanism.

---

## 🔍 **Priority Order (Fallback Mechanism)**

### 1. **`req.ip`** ✅ Primary (Recommended)
```javascript
req.ip // "192.168.1.100"
```
- **Source:** Express built-in property
- **Requirement:** `app.set('trust proxy', true)` harus enabled
- **Benefit:** Otomatis handle proxy/load balancer
- **Format:** Clean IP address (sudah di-process Express)

### 2. **`x-forwarded-for` Header** 🔄 Proxy/Load Balancer
```javascript
req.headers['x-forwarded-for'] // "203.0.113.1, 70.41.3.18, 150.172.238.178"
```
- **Source:** HTTP header dari proxy (Nginx, Apache, CloudFlare, etc)
- **Format:** Multiple IPs (comma-separated)
- **Logic:** Ambil IP pertama (client IP asli)
- **Example:**
  ```
  Client (203.0.113.1) 
    → Proxy1 (70.41.3.18) 
    → Proxy2 (150.172.238.178) 
    → Your Server
  
  Header: "203.0.113.1, 70.41.3.18, 150.172.238.178"
  We extract: "203.0.113.1" (client IP)
  ```

### 3. **`x-real-ip` Header** 🔄 Nginx Specific
```javascript
req.headers['x-real-ip'] // "203.0.113.1"
```
- **Source:** Custom header dari Nginx
- **Format:** Single IP
- **Benefit:** Lebih simple dari x-forwarded-for

### 4. **`req.connection.remoteAddress`** 🔌 Direct Connection
```javascript
req.connection.remoteAddress // "::ffff:192.168.1.100" or "192.168.1.100"
```
- **Source:** TCP connection
- **Format:** Bisa IPv4 atau IPv6-mapped IPv4
- **Note:** Kita strip `::ffff:` prefix

### 5. **`req.socket.remoteAddress`** 🔌 Fallback Socket
```javascript
req.socket.remoteAddress // "::ffff:192.168.1.100" or "192.168.1.100"
```
- **Source:** Socket connection (alternative to connection.remoteAddress)
- **Format:** Same as connection.remoteAddress

---

## ⚙️ **Configuration Required**

### **app.js - Enable Trust Proxy**
```javascript
const express = require('express');
const app = express();

// ✅ WAJIB untuk mendapatkan IP address yang benar
app.set('trust proxy', true);
```

### **Trust Proxy Options**

#### **Option 1: Trust All Proxies** (Development/Simple Setup)
```javascript
app.set('trust proxy', true);
```

#### **Option 2: Trust Specific IP/Subnet** (Production Recommended)
```javascript
// Trust specific proxy IP
app.set('trust proxy', '127.0.0.1');

// Trust multiple proxies
app.set('trust proxy', ['127.0.0.1', '192.168.1.0/24']);

// Trust CloudFlare IPs (example)
app.set('trust proxy', [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  // ... CloudFlare IP ranges
]);
```

#### **Option 3: Custom Function**
```javascript
app.set('trust proxy', (ip) => {
  // Trust IPs from internal network
  return ip === '127.0.0.1' || ip.startsWith('192.168.');
});
```

---

## 🌍 **Environment Scenarios**

### **1. Development (localhost)**
```
Client: Your browser
IP: ::1 or 127.0.0.1 (localhost)

Result in audit log: "127.0.0.1"
```

### **2. Direct Server (No Proxy)**
```
Client: 203.0.113.1
→ Your Server

req.ip: "203.0.113.1"
Result: "203.0.113.1"
```

### **3. Behind Nginx Proxy**
```
Client: 203.0.113.1
→ Nginx (10.0.0.1)
→ Your Server

Nginx config:
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

req.headers['x-real-ip']: "203.0.113.1"
req.headers['x-forwarded-for']: "203.0.113.1, 10.0.0.1"
req.ip: "203.0.113.1" (if trust proxy enabled)

Result: "203.0.113.1"
```

### **4. Behind Load Balancer (AWS, CloudFlare)**
```
Client: 203.0.113.1
→ CloudFlare (104.16.0.1)
→ AWS ELB (10.0.0.2)
→ Your Server

req.headers['x-forwarded-for']: "203.0.113.1, 104.16.0.1, 10.0.0.2"
req.ip: "203.0.113.1" (if trust proxy enabled)

Result: "203.0.113.1"
```

---

## 🧪 **Testing IP Detection**

### **Test Endpoint (Temporary)**
Add this to your routes for testing:

```javascript
// routes/index.js
router.get('/test-ip', (req, res) => {
  res.json({
    'req.ip': req.ip,
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-real-ip': req.headers['x-real-ip'],
    'connection.remoteAddress': req.connection?.remoteAddress,
    'socket.remoteAddress': req.socket?.remoteAddress,
    'detected': AuditLogger.getIpAddress(req)
  });
});
```

### **Test dari Browser**
```bash
curl http://localhost:3000/test-ip
```

### **Test dengan Custom Header**
```bash
curl http://localhost:3000/test-ip \
  -H "X-Forwarded-For: 203.0.113.1, 70.41.3.18"
```

**Expected Output:**
```json
{
  "req.ip": "::1",
  "x-forwarded-for": "203.0.113.1, 70.41.3.18",
  "x-real-ip": null,
  "connection.remoteAddress": "::1",
  "socket.remoteAddress": "::1",
  "detected": "203.0.113.1"
}
```

---

## 🔒 **Security Considerations**

### ⚠️ **Warning: IP Spoofing**

Jika `trust proxy = true` tanpa restriction:
```bash
# Attacker bisa fake IP dengan header
curl http://your-server.com/login \
  -H "X-Forwarded-For: 1.1.1.1" \
  -d "email=admin@example.com&password=password"

# Audit log akan catat IP: 1.1.1.1 (FAKE!)
```

### ✅ **Best Practice - Production**

```javascript
// Option 1: Trust only your proxy IPs
app.set('trust proxy', ['10.0.0.1', '10.0.0.2']); // Your load balancer IPs

// Option 2: Trust based on hop count
app.set('trust proxy', 1); // Trust first proxy only

// Option 3: Custom validation
app.set('trust proxy', (ip) => {
  // Only trust internal network
  return ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('192.168.');
});
```

---

## 📊 **Current Implementation**

### **File: `helpers/auditLogger.js`**

```javascript
static getIpAddress(req) {
  if (!req) return null;

  // 1. Try Express req.ip (works with trust proxy enabled)
  if (req.ip) {
    return req.ip.replace(/^::ffff:/, '');
  }

  // 2. Try x-forwarded-for header (for proxies)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim(); // First IP = client IP
  }

  // 3. Try x-real-ip header (Nginx)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }

  // 4. Fallback to connection
  if (req.connection?.remoteAddress) {
    return req.connection.remoteAddress.replace(/^::ffff:/, '');
  }

  // 5. Fallback to socket
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress.replace(/^::ffff:/, '');
  }

  return null;
}
```

### **Features:**
- ✅ Multiple fallback mechanisms
- ✅ Handle IPv6-mapped IPv4 (`::ffff:` prefix removal)
- ✅ Extract client IP from proxy chain
- ✅ Support multiple proxy types (Nginx, AWS, CloudFlare)
- ✅ Null-safe (won't crash if req is undefined)

---

## 🎯 **Summary**

### **Development (localhost)**
- IP: `127.0.0.1` or `::1`
- Source: Direct connection
- No proxy needed

### **Production (with proxy)**
- IP: Client's real IP
- Source: `x-forwarded-for` or `x-real-ip` header
- Requires: `trust proxy = true`

### **Best Practice**
1. ✅ Enable `app.set('trust proxy', true)` in `app.js`
2. ✅ Use specific proxy IPs in production for security
3. ✅ Test dengan curl untuk verify IP detection
4. ✅ Monitor audit logs untuk detect spoofing attempts

---

## 📚 **References**

- [Express Trust Proxy Guide](https://expressjs.com/en/guide/behind-proxies.html)
- [X-Forwarded-For Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)
- [Nginx Proxy Headers](http://nginx.org/en/docs/http/ngx_http_proxy_module.html)

---

**Status:** ✅ Implemented & Configured  
**Updated:** January 5, 2026

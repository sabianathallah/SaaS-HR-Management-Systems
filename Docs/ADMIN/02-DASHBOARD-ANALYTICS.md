# 📊 DASHBOARD & ANALYTICS - ADMIN

> Deep dive into admin dashboard, analytics, dan advanced reporting

---

## 🎯 Overview

Dashboard Admin adalah **command center** untuk monitoring seluruh aktivitas HR dalam satu halaman. Dilengkapi dengan:
- 📊 Real-time KPI metrics
- 📈 Interactive charts
- 🔍 Deep insights & analytics
- 📉 Trend analysis
- 🚨 Alert system

---

## 📊 KPI Cards Deep Dive

### 1. Total Employees

**Metric Calculation:**
```javascript
const totalEmployees = await User.count();
// Result: 150
```

**Data Source:** Users table  
**Update Frequency:** Real-time  
**Trend:** Compare dengan bulan lalu

**Insights:**
- Track company growth
- Headcount planning
- Budget forecasting

**Visual:**
```
┌─────────────────────┐
│ 👥 Total Employees  │
│     150             │
│  ↑ +5 this month    │
│  Growth: +3.4%      │
└─────────────────────┘
```

**Color Coding:**
- 🟢 Green: Growth positive
- 🔴 Red: Decrease
- ⚪ Gray: No change

---

### 2. Active Employees

**Metric Calculation:**
```javascript
const activeEmployees = await User.count({
  where: { isActive: true }
});
// Result: 142
```

**Formula:**
```
Active Rate = (Active / Total) × 100%
            = (142 / 150) × 100%
            = 94.7%
```

**Benchmark:**
- ✅ Good: > 95%
- ⚠️ Warning: 90-95%
- 🔴 Critical: < 90%

**Use Cases:**
- Monitor active workforce
- Track resignations
- Identify inactive accounts

---

### 3. Today's Present

**Metric Calculation:**
```javascript
const todayPresent = await Attendance.count({
  where: {
    date: today,
    status: {
      [Op.notIn]: ['ABSENT']
    }
  }
});
// Result: 142 / 150 = 94.7%
```

**Included Status:**
- ON_PROGRESS
- ON_TIME
- LATE

**Excluded Status:**
- ABSENT
- LEAVE
- HOLIDAY

**Target KPI:** ≥ 95% attendance rate

---

### 4. Late Arrivals

**Metric Calculation:**
```javascript
const lateToday = await Attendance.count({
  where: {
    date: today,
    status: 'LATE'
  }
});
// Result: 8 / 142 = 5.6%
```

**Threshold:**
- ✅ Good: < 5%
- ⚠️ Warning: 5-10%
- 🔴 Critical: > 10%

**Actions When High:**
1. Identify patterns (traffic, weather)
2. Review shift times
3. Counseling for repeat offenders
4. Adjust policies if needed

---

### 5. Absent Today

**Metric Calculation:**
```javascript
const absentToday = await Attendance.count({
  where: {
    date: today,
    status: 'ABSENT'
  }
});
// Result: 5 / 150 = 3.3%
```

**Includes:**
- No clock-in (auto-set)
- Manual absent

**Excludes:**
- Approved leaves
- Holidays

**Follow-up Actions:**
1. Contact absent employees
2. Check for unauthorized absence
3. Update attendance records
4. Apply attendance policies

---

### 6-12. [Similar detailed breakdown for other KPIs]

---

## 📈 Charts & Visualizations

### 1. Attendance Trend Chart

**Type:** Line Chart  
**Library:** Chart.js  
**Period:** 7 days / 30 days

**Data Structure:**
```javascript
{
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Present',
      data: [142, 145, 143, 140, 144, 20, 15],
      borderColor: '#10B981', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Late',
      data: [8, 5, 7, 10, 6, 2, 1],
      borderColor: '#F59E0B', // Yellow
      backgroundColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Absent',
      data: [5, 3, 4, 6, 5, 128, 135],
      borderColor: '#EF4444', // Red
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }
  ]
}
```

**Configuration:**
```javascript
const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Attendance Trend (Last 7 Days)'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          label += context.parsed.y + ' employees';
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 20
      }
    }
  }
};
```

**Insights from Chart:**
- 📈 Trend naik/turun
- 🔍 Pattern keterlambatan (hari tertentu?)
- 📊 Comparison week-over-week
- 🎯 Target achievement tracking

---

### 2. Status Distribution (Doughnut Chart)

**Visual:**
```
     Doughnut Chart
     ┌─────────────┐
     │             │
     │   ON_TIME   │ 60% (Green)
     │   LATE      │ 25% (Yellow)
     │   ABSENT    │ 10% (Red)
     │   LEAVE     │ 5%  (Blue)
     │             │
     └─────────────┘
```

**Data:**
```javascript
{
  labels: ['On Time', 'Late', 'Absent', 'Leave'],
  datasets: [{
    data: [85, 35, 15, 7],
    backgroundColor: [
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#3B82F6'  // Blue
    ],
    hoverOffset: 4
  }]
}
```

**Use Case:**
- Quick snapshot hari ini
- Visual proportion
- Identify issues (banyak absent/late?)

---

## 📊 Advanced Analytics

### Attendance Patterns

**Weekly Pattern Analysis:**
```
Monday:    Late Peak (traffic jam)
Tuesday:   Normal
Wednesday: Normal
Thursday:  Normal
Friday:    Early leave pattern
Saturday:  Low attendance (weekend shift)
Sunday:    Low attendance (weekend shift)
```

**Monthly Trend:**
```
Bulan     Absent%   Late%   On-Time%
Jan       3.5%      5.2%    91.3%
Feb       2.8%      4.5%    92.7%
Mar       4.1%      6.8%    89.1%
```

**Insights:**
- Identifikasi pola seasonal
- Plan for high-absent periods
- Adjust policies

---

### Employee Performance Metrics

**Top Performers (Never Late):**
```
1. Siti Nurhaliza  - 100% On-Time (22/22 days)
2. Ahmad Fauzi     - 100% On-Time (22/22 days)
3. Dewi Lestari    - 95.5% On-Time (21/22 days)
```

**Need Attention (Frequent Late):**
```
1. Budi Santoso    - 8 Late arrivals this month
2. Ani Wijaya      - 6 Late arrivals this month
3. Citra Dewi      - 5 Late arrivals this month
```

**Actions:**
- Recognition for top performers
- Counseling for frequent late
- Performance review data

---

### Leave Analytics

**Leave Usage by Department:**
```
Engineering:     45% of quota used
Sales:          62% of quota used
HR:             38% of quota used
Finance:        51% of quota used
```

**Leave Pattern:**
```
Peak Leave Periods:
- December: Holiday season (35% on leave)
- July: School vacation (28% on leave)
- April: Lebaran (40% on leave)

Low Leave Periods:
- January: Post-holiday (8% on leave)
- September: Mid-year (12% on leave)
```

**Forecast:**
- Plan staffing for peak periods
- Manage leave approvals
- Prevent understaffing

---

### Overtime Analytics

**Overtime by Department:**
```
Engineering:  120 hours (highest)
Sales:        45 hours
Finance:      80 hours
HR:          15 hours (lowest)
```

**Overtime Cost:**
```
Total Monthly Overtime:   260 hours
Avg Rate:                 Rp 75,000/hour
Total Cost:              Rp 19,500,000
```

**Insights:**
- Budget monitoring
- Workload distribution
- Hiring needs assessment

---

## 🔍 Drill-Down Features

### Click-Through Navigation

**From Dashboard → Detail:**

**Example 1: Late Employees Card**
```
Click "8 Late Today"
    ↓
Opens filtered attendance table:
- Today's date
- Status = LATE
- Shows: Name, Time, Photo, GPS
```

**Example 2: Location Violations**
```
Click "7 Outside Radius"
    ↓
Opens location review page:
- GPS coordinates
- Distance from office
- Photo verification
- Approve/Reject actions
```

**Example 3: Pending Approvals**
```
Click "12 Pending Leave"
    ↓
Redirect to Leave Management
- Filter: Status = PENDING
- Bulk approve option
```

---

## 📱 Responsive Dashboard

### Desktop View (> 1024px)
```
┌──────────────────────────────────────────┐
│  Header                                  │
├────────┬─────────────────────────────────┤
│        │  KPI Cards (4 columns)          │
│ Side   ├─────────────────────────────────┤
│ bar    │  Charts (2 columns)             │
│        ├─────────────────────────────────┤
│        │  Tables (Full width)            │
└────────┴─────────────────────────────────┘
```

### Tablet View (768-1024px)
```
┌──────────────────────────────┐
│  Header (collapsed sidebar)  │
├──────────────────────────────┤
│  KPI Cards (2 columns)       │
├──────────────────────────────┤
│  Charts (1 column)           │
├──────────────────────────────┤
│  Tables (scrollable)         │
└──────────────────────────────┘
```

### Mobile View (< 768px)
```
┌──────────────────┐
│  Header (burger) │
├──────────────────┤
│  KPI (1 column)  │
│  Stacked cards   │
├──────────────────┤
│  Charts          │
│  (scrollable)    │
├──────────────────┤
│  Tables          │
│  (horizontal     │
│   scroll)        │
└──────────────────┘
```

---

## 🔔 Alert System

### Automated Alerts

**High Absent Rate Alert:**
```
⚠️ ALERT: High Absent Rate
Today's absent rate: 8.5% (threshold: 5%)
13 employees absent
Action required: Contact HR team
```

**Location Violations Alert:**
```
⚠️ ALERT: Multiple Location Violations
15 employees clocked in outside radius
Requires manual review and approval
```

**Pending Approvals Alert:**
```
⚠️ ALERT: Pending Approvals Backlog
25 leave requests pending (SLA: 24h)
8 overtime requests pending
Action: Process approvals immediately
```

---

## 📊 Custom Reports

### Report Builder

**Available Filters:**
- Date Range
- Department
- Employee
- Status
- Shift

**Report Types:**
1. Attendance Summary
2. Leave Report
3. Overtime Report
4. Performance Report
5. Custom Report

**Export Options:**
- 📊 Excel (.xlsx)
- 📄 PDF
- 📋 CSV
- 📧 Email delivery

---

## ⚡ Performance Optimization

### Data Caching

**Cached Metrics:**
- Employee count (5 min TTL)
- Department list (1 hour TTL)
- Shift list (1 hour TTL)

**Real-Time Data:**
- Today's attendance
- Pending approvals
- Recent activities

**Optimization:**
```javascript
// Parallel fetching
const [employees, attendance, leaves] = await Promise.all([
  User.findAll(),
  Attendance.findAll({ where: { date: today } }),
  LeaveRequest.findAll({ where: { status: 'PENDING' } })
]);
```

---

## 🎨 Customization

### Theme Options
- Light mode (default)
- Dark mode
- Custom colors

### Widget Arrangement
- Drag & drop KPI cards
- Show/hide widgets
- Custom layout

### Personalization
- Save preferred view
- Custom date ranges
- Favorite filters

---

## 📈 Future Enhancements

### Planned Features
- 🤖 AI-powered insights
- 📊 Predictive analytics
- 🔮 Forecasting
- 📱 Mobile app
- 🔔 Push notifications
- 📧 Scheduled reports
- 🎯 Goal tracking

---

## ✅ Best Practices

### Daily Routine
- ✅ Check dashboard setiap pagi
- ✅ Review pending approvals
- ✅ Monitor location violations
- ✅ Check alert notifications
- ✅ Review attendance anomalies

### Weekly Routine
- ✅ Generate weekly report
- ✅ Analyze trends
- ✅ Team performance review
- ✅ Plan staffing for next week

### Monthly Routine
- ✅ Monthly performance report
- ✅ Budget review (overtime)
- ✅ Leave quota monitoring
- ✅ Strategic planning

---

**Last Updated:** January 15, 2026  
**Version:** 1.0.0

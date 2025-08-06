# Unisan Emergency Reporting and Response App (UERRA)

### 🚀 Summary

A real-time **cross-platform emergency reporting system** for Unisan citizens and agencies. It enables fast, **category-based report routing** to the appropriate authorities (PNP, BFP, Hospital, MDRMMO, RHU, etc.), provides **emergency tips** to citizens, and **equipment suggestions** to responders.

---

### 🔐 Tech Stack

* **Frontend** : React (React Native for mobile, ReactJS for web)
* **Backend & DB** : Supabase (PostgreSQL, Realtime, Functions, RLS)
* **Authentication** : Supabase Auth (Email/Password + OAuth 2.0 Google)
* **Push Notifications** : Firebase Cloud Messaging (FCM)
* **Geo-location** : React Native Location + Supabase PostGIS
* **Maps & Routing** : Google Maps (via API) or OpenStreetMap
* **AI/Rule-Based Suggestions** : Rules engine (upgradeable to ML later)

---

### 👥 User Roles

#### 1. Super Admin

* Full access (developer)
* Manage all agencies and system configurations
* View full logs and analytics

#### 2. Municipal Admin (Mayor’s Office)

* View all reports
* Manage categories and agencies

#### 3. Agencies

* PNP (Police), BFP (Fire), Hospital, MDRMMO (Disaster), RHU (Health)
* Have their own dashboard
* View/respond to assigned reports
* View equipment checklist suggestions

#### 4. Citizens

* Report incidents in real-time
* View emergency tips
* Track report status updates

---

### 📲 App Features

#### 🧍 Citizen App

* Login/Register via email or Google
* Quick report form:
  * Choose category (e.g. Fire, Medical, Crime)
  * Description, optional photo/video
  * Auto-detect location (with manual override)
* Real-time report status tracking
* Emergency tips based on report type
* Safety instructions or first-aid
* View report history
* Emergency hotline call shortcut

#### 🏢 Agency App

* Dashboard of incoming reports by category
* Live map view with pins
* Accept, assign, update reports
* Suggested equipment checklist
* Report update notes and history

#### 🧑‍💼 Admin App

* Manage agency and category records
* View logs and export data
* See analytics: frequency, response time, barangay breakdown

#### 🧑‍💻 Super Admin

* Full backend + database access
* Role management
* System updates and patches

---

### 🧠 Intelligent Logic

#### ✅ Auto-Routing Engine

Routes based on selected category:

* Fire → BFP
* Medical → Hospital/RHU
* Crime → PNP
* Disaster (Flood, Typhoon) → MDRMMO

Each report can notify multiple agencies.

#### ✅ Equipment Suggestion

Predefined equipment per category:

* Fire → Hose, Ladder, Water Tank
* Medical → First Aid, Stretcher
* Crime → Patrol Car, Handcuffs
* Flood → Boat, Life Vest

#### ✅ Emergency Tips

* Predefined per category
* Pulled from Supabase based on report category
* Fire → "Stay low", "Avoid elevators"
* Medical → "Apply pressure to wound"
* Typhoon → "Stock food & clean water"

---

### 🔒 Authentication & Authorization

* Supabase Auth: Email/Password + Google OAuth
* Role-based dashboard
* Row-Level Security (RLS) for access control

---

### 📡 Notifications

* Citizens get notified when:
  * Report is acknowledged
  * Responders en route
  * Case resolved
* Agencies receive alerts for new reports

---

### 🗃️ Database Schema (Simplified)

**users**

* `id` (UUID)
* `role`: citizen, admin, agency, superadmin
* `email`, `name`
* `agency_id` (nullable)

**reports**

* `id`, `user_id`, `category_id`
* `description`, `photo_url`, `location (lat,lng)`
* `status`: pending, accepted, resolved
* `assigned_agency_ids`: array

**categories**

* `id`, `name`
* `assigned_agencies`: array
* `emergency_tips`, `suggested_equipment`: array

**agencies**

* `id`, `name`, `location`, `contact`

---

### ✅ MVP - Phase 1

* [ ] React Native mobile app
* [ ] React web dashboard for admins/agencies
* [ ] Google + email login
* [ ] Report submission
* [ ] Auto-routing logic
* [ ] Category & agency management
* [ ] Emergency tips and equipment logic
* [ ] Push notifications

---

### 🛣️ Future Upgrades

* [ ] AI suggestions based on previous patterns
* [ ] Real-time responder GPS tracking
* [ ] Emergency simulation tools for agencies
* [ ] SMS fallback system
* [ ] Analytics per barangay and time of day

cd EcoCycle
node server.js

## 🧾 **README.md**

```markdown
# ♻️ EcoCycle — A Sustainable Waste Management System

EcoCycle is a **web-based smart waste management system** built to promote **recycling, sustainability, and eco-friendly habits** in communities.  
It allows **users** to register, report waste disposal (by weight and type), track their submissions, and provide feedback, while **administrators** can monitor, approve, or decline waste collection requests in real time.

---

## 🌍 **Objective**

To build a **smart, digital waste management platform** that helps:
- Reduce waste through recycling and proper segregation.
- Encourage citizens to earn points for waste recycling.
- Empower local authorities with digital waste tracking and community engagement tools.

---

## 🧠 **Core Features**

### 🧑‍💼 **For Users**
- User registration & login (with password and contact info)
- Submit waste disposal reports (e.g., plastics, paper, glass, organic)
- View request status (pending, approved, accomplished)
- See payment/points rewards
- Send feedback to the admin
- Logout without losing stored info
- Dashboard auto-saves data locally (no data lost on refresh)

### 👨‍💻 **For Admin**
- Admin login with secure access
- View all users and their details
- Approve or decline waste requests
- Update or delete user data
- Toggle request accomplishment status
- View feedback from users
- Dashboard stats: total users, total requests, pending/approved
- Professional sidebar layout and live updates without reload

---

## ⚙️ **Technologies Used**

| Layer | Tools / Libraries |
|-------|--------------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla JS) |
| Backend | Node.js, Express.js |
| Storage | JSON file (`progress.json`) |
| Runtime | Localhost (No external APIs) |

No external AI APIs or databases are required — this system runs **fully offline** using Node.js and JSON for data persistence.

---

## 🗂️ **Project Folder Structure**

```

EcoCycle/
├─ package.json            # Node.js project info & dependencies
├─ server.js               # Express backend server (API endpoints)
├─ progress.json           # Data storage for users, requests, and feedback
├─ public/
│  ├─ index.html           # Home page with user login/register options
│  ├─ user.html            # User dashboard (waste submissions)
│  ├─ admin.html           # Admin dashboard (monitor & approval system)
│  ├─ community.html       # Events & campaigns section
│  ├─ app.js               # Frontend logic (requests, login, updates)
│  └─ style.css            # Modern styling for all pages

````

---

## 🚀 **How to Run the Project (Using CMD)**

### **1️⃣ Prerequisites**
Make sure you have **Node.js** installed on your system.  
To verify, run:
```bash
node -v
npm -v
````

If not installed, download from: [https://nodejs.org](https://nodejs.org)

---

### **2️⃣ Steps to Run**

Open **Command Prompt (CMD)** or **Terminal**, then:

```bash
# Step 1: Go to your project folder
cd EcoCycle

# Step 2: Install dependencies
npm install

# Step 3: Start the server
node server.js
```

---

### **3️⃣ Access in Browser**

Once the server starts, open:

* 🌿 User Interface → [http://localhost:3000]
* 🧑‍🏫 Admin Dashboard → [http://localhost:3000/admin.html]


---

## 🔐 **Login Flow**

| Page              | Description                                      |
| ----------------- | ------------------------------------------------ |
| `/index.html`     | Choose **Register** or **Login** as a user       |
| `/user.html`      | After login, users can submit waste reports      |
| `/admin.html`     | Admin logs in to approve or decline requests     |
| `/community.html` | Displays events, recycling drives, and campaigns |

---

## 💾 **Data Storage (progress.json)**

All user and admin data, requests, and feedback are saved in the `progress.json` file, for example:

```json
{
  "users": [
    {
      "id": "U001",
      "name": "Yusuf Faruk",
      "email": "yusuf@gmail.com",
      "password": "12345",
      "address": "Bauchi",
      "state": "Bauchi",
      "country": "Nigeria"
    }
  ],
  "requests": [],
  "feedback": []
}
```

---

## 💡 **Possible Future Improvements**

* 🌱 Add reward system with eco-points & redeem options
* 🗺️ Add map integration for collection routes
* 📱 Convert to mobile-friendly Progressive Web App (PWA)
* 🧾 Export waste records as Excel or PDF
* 🔔 Real-time notifications via WebSocket

---

## 👨‍🎓 **Project Prepared By**

**Project Title:** *EcoCycle — A Sustainable Waste Management System*
**Developed by:** *Faruk Nurudeen (Prof. Faruk)*
**Institution:** *Federal Polytechnic Bauchi, Nigeria*
**Supervisor:** *—*
**Date:** *2025*

---

## 🙏 **Acknowledgment**

Special thanks to my tutors and colleagues for their guidance and inspiration in making this project a success.

---

## 🏁 **End Note**

> “EcoCycle is not just a system — it’s a movement towards cleaner, greener living.
> Together, we can make our planet sustainable, one bin at a time.”

```

---

✅ **Save this as:**  
`EcoCycle/README.md`

Then you can view it beautifully formatted on GitHub or any markdown viewer.

---

Would you like me to make a **PDF version** of this README (for submission or printing)?  
It’ll be perfectly formatted for HND or final-year project submission.
```

# Store Rating Application

A full-stack web application built with Next.js that allows users to register, log in, and rate stores on the platform.  
The system supports multiple roles (Admin, Normal User, Store Owner), each with different access and functionality.

---

## 🚀 Tech Stack
- **Frontend:** React.js (with Next.js)  
- **Backend:** JSON Server (mock backend with REST API)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  

---

## ✨ Features

### 🔑 Authentication & User Management
- Single login system with role-based access (Admin, Normal User, Store Owner).  
- Secure signup and login for Normal Users.  
- Store Owners and Admins can log in with assigned credentials.  
- Password update functionality for all users.  
- Strong form validations:
  - **Name:** 20–60 characters  
  - **Address:** up to 400 characters  
  - **Password:** 8–16 characters, must include at least one uppercase and one special character  
  - **Email:** valid email format  

---

### 👩‍💼 System Administrator
- Add new stores, normal users, and admin users.  
- Dashboard with summary:
  - Total users  
  - Total stores  
  - Total submitted ratings  
- Manage users (create, view, filter by Name, Email, Address, Role).  
- View and manage store listings (Name, Email, Address, Rating).  
- View detailed information about all users.  
- Logout functionality.  

---

### 👤 Normal User
- Register with Name, Email, Address, and Password.  
- Log in and update password.  
- View all registered stores.  
- Search for stores by **Name** and **Address**.  
- Store listing includes:
  - Store Name  
  - Address  
  - Overall Rating  
  - User’s Submitted Rating  
- Submit new ratings (1–5) for stores.  
- Modify previously submitted ratings.  
- Logout functionality.  

---

### 🏪 Store Owner
- Log in and update password.  
- Dashboard includes:
  - List of users who submitted ratings for their store  
  - Average rating of their store  
- Logout functionality.  

---

### 📊 General Features
- All tables (users, stores, ratings) support **sorting** (ascending/descending) by key fields such as Name, Email, Rating, etc.  
- Clean, responsive UI built with Tailwind CSS.  
- Mock backend using JSON Server for easy testing.  

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository
git clone <repository-url>
cd store-rating-app

### Run the Backend (JSON Server)
cd server
npm install -g json-server
json-server --watch db.json --port 5004

This will start a mock backend on http://localhost:5004

### Run the Frontend (Next.js + React)
cd ..
npm install
npm run dev

Frontend will be available at http://localhost:3000


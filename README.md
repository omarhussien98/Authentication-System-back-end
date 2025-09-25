<img width="937" height="500" alt="API" src="https://github.com/user-attachments/assets/ddf2532f-e234-4589-86ca-2f0c1db15f4d" />

-------

# Authentication System - Back-End

This is the **Back-End** of the Authentication System project.  
It provides secure user management, authentication, and API endpoints that connect with the Front-End.  

👉 **Front-End Repository & Live Demo**:  
- GitHub Repo: [Authentication-System](https://github.com/omarhussien98/Authentication-System)  
- Live Demo: [View Front-End Live](https://omarhussien98.github.io/Authentication-System/)  

---

## ✨ Features

- User registration with validation  
- Secure login with hashed passwords  
- MongoDB integration
- RESTful API endpoints (GET, POST)
- JWT-based authentication for secure sessions

---

## 🛠 Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Postman (for API testing - optional)

---

## 🚀 Tech Stack

- Node.js + Express.js  
- CORS
- MongoDB/Mongoose
- JWT Authentication

---

## Environment Variables

Create a .env file in the project root with the following variables:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000

----
## 💻 How to Run Locally

### git clone https://github.com/omarhussien98/Authentication-System-back-end.git
### cd Authentication-System-back-end
### npm install
### npm start
### http://localhost:3000/api/health
----

## 💡 Usage Notes
- Passwords are securely hashed, and JWT tokens are implemented for robust authentication.

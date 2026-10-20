# 🚀 Employee App Backend Integration - Assignment 3

## 📋 Overview
This project completes the backend integration for the Employee App using **Node.js**, **Express**, and **MongoDB Atlas** (via **Mongoose**). The frontend code is pre-built and served directly from the `dist/Frontend` directory.

---

## 🛠️ Tech Stack & Dependencies
- **Runtime:** Node.js
- **Server Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Utilities:** CORS, dotenv, morgan

---

## 📁 Directory Structure
```text
pad1/
├── dist/
│   └── Frontend/           # Pre-built Frontend distribution files (unchanged)
│       ├── index.html
│       ├── main.*.js
│       ├── polyfills.*.js
│       ├── runtime.*.js
│       ├── styles.*.css
│       └── favicon.ico
├── model/
│   └── employeeList.js     # Mongoose Schema & Model for Employee
├── .env                    # Environment variables (PORT, MONGODB_URI)
├── .env.example            # Sample environment variables template
├── .gitignore              # Git ignore rules
├── app.js                  # Main Express backend with all API endpoints
├── package.json            # Node.js project configuration & dependencies
└── README.md               # Documentation & API specifications
```

---

## 🗄️ Employee Schema

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | String | Yes | Full name of the employee |
| `location` | String | Yes | Office location |
| `position` | String | Yes | Job designation / role |
| `salary` | Number | Yes | Annual / monthly salary |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Request Body Format |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/employeelist` | Retrieve all employees from database | None |
| **GET** | `/api/employeelist/:id` | Retrieve a single employee by ID | None |
| **POST** | `/api/employeelist` | Add a new employee | `{"name": "string", "location": "string", "position": "string", "salary": number}` |
| **PUT** | `/api/employeelist` | Update an existing employee (by body `_id` / `id`) | `{"_id": "string", "name": "string", "location": "string", "position": "string", "salary": number}` |
| **PUT** | `/api/employeelist/:id` | Update an existing employee (by route `:id`) | `{"name": "string", "location": "string", "position": "string", "salary": number}` |
| **DELETE** | `/api/employeelist/:id` | Delete a single employee by ID | None |

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
Navigate to the `pad1` folder and install dependencies:
```bash
cd pad1
npm install
```

### 2. Configure MongoDB Atlas Connection
Create a `.env` file in `pad1` (or use the provided `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/EmployeeDB?retryWrites=true&w=majority
```
Replace `<username>`, `<password>`, and `<cluster-url>` with your actual MongoDB Atlas credentials.

### 3. Run the Server
```bash
npm start
```
Or for development with automatic restarts:
```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```
The pre-built frontend interface will load and connect seamlessly with the backend REST API!

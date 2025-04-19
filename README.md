
   # Balanc - Personal Finance Management Application

- [Balanc Dashboard Preview](https://balanc.vercel.app)


<div align="center">

[![GitHub license](https://img.shields.io/github/license/yourusername/balanc?style=flat-square)](https://github.com/yourusername/balanc/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)
[![Contributors](https://img.shields.io/github/contributors/yourusername/balanc?style=flat-square)](https://github.com/yourusername/balanc/graphs/contributors)

</div>
 Balanc is a comprehensive personal finance management application designed to help users track their income, expenses, investments, and transactions in one place. Built with modern web technologies, Balanc offers a seamless user experience with powerful visualization tools.


## Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Contributing](#-contributing)


- [Contact](#-contact)

## ✨ Features

### Core Functionality
- **Comprehensive Dashboard**
  - Financial health overview
  - Monthly spending trends
  - Net worth tracking

- **Income Management**
  - Multiple income source tracking
  - Recurring income detection
  - Income categorization

- **Expense Tracking**
  - Smart expense categorization
  - Budget alerts and notifications
  - Receipt scanning integration

- **Investment Monitoring**
  - Real-time portfolio tracking
  - Asset allocation visualization
  - Historical performance charts

- **Transaction System**
  - Advanced filtering (date, amount, category)
  - Bulk transaction operations
  - CSV import/export

### Technical Features
- 🔒 Secure authentication (Google OAuth + JWT)
- ⚡ Redis caching for frequent queries
- 📊 Interactive data visualizations
- 📱 Fully responsive design
- 🔄 Real-time data synchronization

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Beautiful component library |
| Framer Motion | Smooth animations |
| Chart.js | Data visualization |
| NextAuth.js | Authentication |
| React Hook Form | Form management |
| Redux | State management |
| Axios | HTTP requests |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express | Web framework |
| MongoDB | Database (with Mongoose) |
| Redis | Caching layer |
| JWT | Authentication tokens |
| Mongoose | ODM for MongoDB |
| Bcrypt | Password hashing |
| Nodemailer | Email notifications |


## 🚀 Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local MongoDB
- Redis server
- Google OAuth credentials
- Git

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/balanc.git
cd balanc
```

## Installation
### Prerequisites
- Node.js
- MongoDB

## frontend Setup
Navigate to the backend directory:

```sh
cd frontend
```
## Backend Setup
Navigate to the backend directory:
```sh

cd backend
```
## Backend Setup
Navigate to the backend directory:

```sh
cd backend

```
Install dependencies:

```sh
npm install
```


Start the backend server:

```sh
npm run dev
node index.js
```
## Frontend Setup
Navigate to the frontend directory:

```sh

cd frontend
```

Install dependencies:
```sh

npm install
```

Start the frontend server:
```sh

npm run dev
```


## 📸 Configuration

## ⚙️ Environment Configuration

### 🔙 Backend Configuration (`backend/.env`)
```env
# ========================
# 🚀 Server Configuration
# ========================
PORT=8000
NODE_ENV=production
BACKEND_APP_URL=http://localhost:8000
CLIENT_APP_URL=http://localhost:3000

# ========================
# 🗃️ Database Configuration
# ========================
DATABASE_URL=mongodb://localhost:27017/balanc_prod

# ========================
# 🔐 Authentication
# ========================
JWT_SECRET_KEY=your_strong_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# ========================
# 📧 Email Service
# ========================
SMTP_HOST=your.smtp.server.com
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@balanc.app

# ========================
# 🚀 Performance & Caching
# ========================
REDIS_HOST=localhost
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_URL1=redis_backup_url_if_needed
```
### 🔙 frontend Configuration (`frontend/.env`)
```env
# ========================
# 🌐 Application URLs
# ========================
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# ========================
# 🔑 Authentication
# ========================
NEXTAUTH_SECRET=your_nextauth_secret_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ========================
# 📊 Analytics & APIs
# ========================
NEXT_TELEMETRY_DISABLED=1
ANALYZE=true

# RapidAPI Configuration
X_RAPIDAPI=your_rapidapi_key
NEXT_PUBLIC_RAPIDAPI1=api_key_1
NEXT_PUBLIC_RAPIDAPI2=api_key_2
NEXT_PUBLIC_RAPIDAPI3=api_key_3
NEXT_PUBLIC_RAPIDAPI4=api_key_4

# ========================
# 🛠️ Environment
# ========================
NODE_ENV=production
```
## 📸 Screenshots

<!-- Add your actual screenshot paths -->
![Image](https://github.com/user-attachments/assets/002f7adb-3eeb-41dd-9a6e-46e726717f62)
![Image](https://github.com/user-attachments/assets/9745da11-986e-4561-b5fb-5623dbcdb3ac)
![Image](https://github.com/user-attachments/assets/2a867a5a-e40e-424c-8b50-5487f6416470)
![Image](https://github.com/user-attachments/assets/26b33e04-c78c-476f-a674-c8a25fc76df6)
![Image](https://github.com/user-attachments/assets/99941595-e5d5-41d2-9e7b-eafa03d3f086)
![Image](https://github.com/user-attachments/assets/40b86b26-b29d-45aa-93fa-8acd74aae2f2)
## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the code style and include relevant tests.

## Contact
For any questions or suggestions, feel free to contact me.

Happy coding!

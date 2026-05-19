# Career Recommendations Backend

Backend application for managing the business processes of an AI-based career recommendation system. Built using **Express**, **TypeScript**, and **Prisma ORM** to ensure high performance, clean structure, and efficient database integration.

---

## Tech Stack

* **Node.js** (Version 22.13.0)
* **Express.js**
* **TypeScript**
* **Prisma ORM** (version 6.18.0)
* **MySQL / MariaDB**
* **Nodemon**

---

## Installation

Follow the steps below to run the backend locally:

### 1. Clone the Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd rahma-cell-be
```

### 2. Install Dependecies
```bash
npm i/npm install
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Setup Environment Variables
Create a .env file in the project root:
```bash
DATABASE_URL:"mysql://USER:PASSWORDd@HOST:PORT/DATABASE_NAME"
PORT: 5000
ACCESS_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxx
REFRESH_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxx
ACCESS_TOKEN_EXPIRES_IN= (minute)
REFRESH_TOKEN_EXPIRES_IN= (days)
MIDTRANS_SERVER_KEY=xxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=xxxxxxxxxxxxxxxxxxxx
```

## Database Migration
To create tables:
```bash
npx prisma migrate dev --name <migration_name>
```
To open Prisma Studio
```bash
npx prisma studio
```

## Running the Server
Development Mode
```bash
npm run dev
```
Porduction Mode
```bash
npm run build
npm start
```


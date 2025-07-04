# Quiz App 🧠

This is a full-stack Quiz App with:

- **Frontend**: React (Vite + Tailwind CSS)
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL

---

## 🗂️ Project Structure

quiz-app/
├── client/ # React frontend
├── server/ # Node.js backend
├── README.md # Project documentation
Copy
Edit

---

## 🚀 How to Run the Project

### 📌 Prerequisites

- Node.js & npm installed
- PostgreSQL installed & running
- Git (for cloning, optional)

---

### 🔧 1. Set up PostgreSQL

1. Open `psql` or pgAdmin.
2. Run:

```sql
CREATE DATABASE quizapp;
Create the questions table:

sql
Copy
Edit
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL,
    tag VARCHAR(50)
);
Insert sample data or import quiz.sql.

🖥️ 2. Start the Backend
bash
Copy
Edit
cd server
npm install
node index.js
Make sure index.js has the correct PostgreSQL credentials and port (e.g., 3002).

🌐 3. Start the Frontend
bash
Copy
Edit
cd ../client
npm install
npm run dev
Frontend will run at http://localhost:5173 by default.

Make sure your API fetch URL in React points to the backend, e.g.:

tsx
Copy
Edit
fetch("http://localhost:3002/api/questions");
🧪 4. Test with Postman
To fetch questions:

Method: GET

URL: http://localhost:3002/api/questions

📄 .env Setup (Optional)
You can create a .env file for secrets like:

ini
Copy
Edit
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=quizapp
PORT=3002

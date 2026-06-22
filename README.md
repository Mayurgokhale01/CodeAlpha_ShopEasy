# CodeAlpha ShopEasy

A simple full-stack e-commerce demo built with Express, SQLite, and vanilla HTML/CSS/JavaScript.

## Project Structure

- `backend/` — Node.js Express API and SQLite database
- `frontend/` — static HTML, CSS, and JavaScript UI
- `frontend/images/` — local product images used by the app

## Setup

1. Open a terminal in the project root:

   ```powershell
   cd "C:\Users\bharg\OneDrive\Desktop\Full-Stack\internship\Task1"
   ```

2. Install backend dependencies:

   ```powershell
   cd backend
   npm install
   ```

3. Start the server:

   ```powershell
   npm start
   ```

4. Open the app in your browser:

   - `http://localhost:3000`

## Notes

- The backend serves the `frontend/` directory as static files.
- Product images are stored in `frontend/images/`.
- `backend/db.sqlite` is ignored by Git and kept local.

## GitHub

This project is published to:

https://github.com/Mayurgokhale01/CodeAlpha_ShopEasy

## Recommended Workflow

- Edit frontend files in `frontend/`
- Edit backend API code in `backend/`
- Use `npm install` in `backend/` after cloning the repo
- Do not commit `backend/node_modules/` or `backend/db.sqlite`

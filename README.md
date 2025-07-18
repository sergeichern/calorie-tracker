🥗 Calorie Tracker 
A full-stack calorie tracking app built with React, Express, and SQLite. Users can search for foods via the USDA API, log entries, and monitor progress against daily goals.

📌 Planned Enhancements
- Editable calorie goals from the UI
- User authentication with per-user logs
- Graph-based progress trends over time

🚀 Live Links
- Frontend: Vercel Deployment
- Backend: Render API
Update URLs accordingly.

🔧 Features
- Food search with autocomplete from USDA API
- Food logging with calorie and time tracking
- Daily stats and visual progress bar
- Entry deletion with live refresh
- SQLite persistence

📦 Setup (Local)
git clone https://github.com/sergeichern/calorie-tracker.git
cd calorie-tracker


Backend
cd backend
npm install
# .env → USDA_API_KEY=your-key
npm start


Frontend
cd ../frontend
npm install
# .env → REACT_APP_API_URL=https://your-backend-url
npm start



📚 Tech Stack
- Frontend: React, Axios, Vercel
- Backend: Express, SQLite, Render
- API: USDA Food Data

🤝 License
MIT. 

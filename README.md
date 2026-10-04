# Travel Guide — AI Audio Travel Companion

A full-stack web app that generates AI-powered audio travel guides for famous Indian landmarks.

## 🏗️ Project Structure

```
TRAVEL GUIDE_FINAL_CODE/
├── Backend/
│   ├── app.py            # Flask API server
│   ├── requirements.txt  # Python dependencies
│   ├── Procfile          # For Render/Railway/Heroku deployment
│   ├── .env              # API keys (DO NOT commit this)
│   └── .gitignore
└── Frontend/
    ├── index.html        # Main UI
    └── index.js          # Frontend logic
```

## 🚀 Running Locally

### Backend
```bash
cd Backend
pip install -r requirements.txt
python app.py
```
Server runs at: `http://127.0.0.1:5000`

### Frontend
Open `Frontend/index.html` directly in your browser.

## ☁️ Deploying

### Backend → Render (free)
1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, select the `Backend` folder as root
4. Set environment variables: `MURF_API_KEY` and `GEMINI_API_KEY`
5. Build command: `pip install -r requirements.txt`
6. Start command: `gunicorn app:app`

### Frontend → GitHub Pages / Vercel
1. Update the API base URL in `index.js` to your Render backend URL
2. Deploy the `Frontend` folder to Vercel or GitHub Pages

## 🔑 Required API Keys
- **Gemini API**: [aistudio.google.com](https://aistudio.google.com)
- **Murf API**: [murf.ai](https://murf.ai)

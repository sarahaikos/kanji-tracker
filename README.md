# Kanji Tracker

A modern kanji learning application with spaced repetition system, built with Django REST Framework backend and React frontend.

## Features

- 📚 Kanji review sessions with flashcard interface
- 📊 Dashboard with learning statistics and progress tracking
- 🔥 Streak tracking to maintain daily practice
- 🎯 Spaced repetition algorithm for optimal learning
- 💫 Beautiful, modern UI with dark theme

## Project Structure

```
kanji-tracker/
├── kanji_tracker/          # Django backend
│   ├── learning/           # Learning app
│   │   ├── models.py       # Database models
│   │   ├── views/          # API views
│   │   ├── serializers.py  # DRF serializers
│   │   └── services/       # Business logic
│   └── kanji_tracker/      # Django project settings
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API service layer
    │   └── App.jsx         # Main app component
    └── package.json
```

## Setup

### Backend Setup

1. Navigate to the Django project directory:
```bash
cd kanji_tracker
```

2. Activate the virtual environment:
```bash
source ../venv/bin/activate  # On macOS/Linux
# or
..\venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install django djangorestframework django-cors-headers
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Start the Django development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Development

### Backend API Endpoints

The API endpoints are defined in `kanji_tracker/learning/urls.py`. Expected endpoints:

- `GET /api/review/` - Get kanji for review
- `POST /api/review/` - Submit review result
- `GET /api/stats/` - Get dashboard statistics
- `GET /api/kanji/` - Get all kanji
- `POST /api/kanji/` - Add new kanji

### Frontend Development

The frontend uses:
- **React 18** for UI components
- **React Router** for navigation
- **Vite** for fast development and building
- **Axios** for API communication

## Technologies

- **Backend**: Django 5.2, Django REST Framework
- **Frontend**: React 18, Vite, React Router
- **Database**: SQLite (development)

## License

MIT

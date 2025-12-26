# Kanji Tracker

A kanji tracker with spaced repetition system, built with Django REST Framework backend and React frontend.


## Project Structure

```
kanji-tracker/
├── backend/                    # Django backend
│   ├── learning/               # Learning app
│   │   ├── models.py           # Database models
│   │   ├── views/              # API views
│   │   ├── serializers.py      # DRF serializers
│   │   └── services/           # Business logic
│   ├── kanji_data/             # CSV data files
|   |   ├── kanji_class_*.csv   # Kanji data by class
|   |   └── IMPORT_GUIDE.md     # Import instructions
│   └── kanji_tracker/          # Django project settings
└── frontend/                   # React frontend
    ├── src/
    │   ├── components/         # React components
    │   ├── services/           # API service layer
    │   └── App.jsx             # Main app component
    └── package.json
```

## Setup

### Backend Setup

1. Navigate to the Django project directory:
```bash
cd backend
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

- `GET /api/review/` - Get kanji for review (optionally filter by `?mastery_level=X`)
- `POST /api/review/` - Submit review result
- `GET /api/stats/` - Get dashboard statistics
- `GET /api/kanji/` - Get all kanji (optionally filter by `?class=X`)
- `POST /api/kanji/` - Add new kanji

### Importing Kanji Data

To import kanji from CSV files, see the [IMPORT_GUIDE.md](backend/kanji_data/IMPORT_GUIDE.md) in the `kanji_data/` folder.

Quick import command:
```bash
cd backend
source ../venv/bin/activate
python manage.py kanji_data/import_kanji_csv --all
```
** will update with more kanji soon!

## Tech stack

- **Backend**: Django
- **Frontend**: React
- **Database**: SQLite (dev)

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ReviewSession from './components/ReviewSession'
import Dashboard from './components/Dashboard'
import AddKanji from './components/AddKanji'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <span>Kanji Tracker</span>
            </Link>
            <div className="nav-links">
              <Link to="/">Dashboard</Link>
              <Link to="/review">Review</Link>
              <Link to="/add">Add Kanji</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/review" element={<ReviewSession />} />
            <Route path="/add" element={<AddKanji />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App


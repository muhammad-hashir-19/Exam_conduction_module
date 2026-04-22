import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import ExamSession from './pages/ExamSession';
import Login from './pages/Login';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <main style={{ padding: '2rem 0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exam/:id" element={<ExamSession />} />
          </Routes>
        </main>
      </Router>
    </AppProvider>
  );
}

export default App;

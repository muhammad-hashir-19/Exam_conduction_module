import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ExamSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startExamAttempt, submitAnswer, completeExamAttempt, exams, token } = useAppContext();
  
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const initExam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/exams/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const examData = await res.json();
        
        if (!res.ok) throw new Error('Failed to fetch exam');
        
        setExam(examData);
        setTimeLeft(examData.duration * 60);

        // Start attempt on backend
        const attemptRes = await startExamAttempt(id);
        if (attemptRes && attemptRes.id) {
          setAttempt(attemptRes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [id, exams, token]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = async () => {
    if (!selectedAnswer || !attempt) return;

    const currentQuestion = exam.questions[currentQuestionIdx].question;
    
    // Submit answer to backend
    await submitAnswer(attempt.id, currentQuestion.id, selectedAnswer);

    if (currentQuestionIdx < exam.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    const result = await completeExamAttempt(attempt.id);
    setFinalResult(result);
    setSubmitted(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!exam || !attempt || !exam.questions || exam.questions.length === 0) {
    return (
      <div className="container text-center mt-8">
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2>Exam Not Ready</h2>
        <p>This exam either doesn't exist or has no questions assigned to it yet.</p>
        <button onClick={() => navigate('/exams')} className="btn btn-secondary mt-4">Back to Exams</button>
      </div>
    );
  }

  if (submitted && finalResult) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
          {finalResult.status === 'PASSED' ? (
            <CheckCircle size={80} style={{ color: 'var(--success)', margin: '0 auto 1.5rem' }} />
          ) : (
            <AlertCircle size={80} style={{ color: 'var(--danger)', margin: '0 auto 1.5rem' }} />
          )}
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {finalResult.status === 'PASSED' ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <h2 style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {finalResult.status === 'PASSED' ? 'You have passed the exam.' : 'You did not meet the passing score.'}
          </h2>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p style={{ margin: 0 }}>Your Score</p>
              <h1 style={{ fontSize: '3rem', margin: 0, color: finalResult.status === 'PASSED' ? 'var(--success)' : 'var(--danger)' }}>
                {finalResult.score}
              </h1>
            </div>
            <div style={{ borderRight: '1px solid var(--border)' }}></div>
            <div>
              <p style={{ margin: 0 }}>Status</p>
              <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{finalResult.status}</h1>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/exams')}>
              More Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionRecord = exam.questions[currentQuestionIdx];
  const currentQuestion = currentQuestionRecord ? currentQuestionRecord.question : null;

  if (!currentQuestion) return null;

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="badge badge-primary mb-2">{exam.skill?.name} Assessment</span>
          <h2>{exam.title}</h2>
        </div>
        <div style={{ background: 'rgba(30,41,59,0.8)', padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}>
          <Clock size={20} style={{ color: timeLeft < 300 ? 'var(--danger)' : 'var(--warning)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'monospace', color: timeLeft < 300 ? 'var(--danger)' : 'white' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="card glass-panel mb-6">
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {currentQuestionIdx + 1} of {exam.questions.length}
          </span>
          <h3 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{currentQuestion.text}</h3>
        </div>

        <div className="grid grid-cols-1 stagger-1">
          {currentQuestion.options?.map((opt, idx) => (
            <label 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                border: `1px solid ${selectedAnswer === opt ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedAnswer === opt ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease',
                marginBottom: '0.75rem'
              }}
            >
              <input 
                type="radio"
                name="quiz_option"
                checked={selectedAnswer === opt}
                onChange={() => setSelectedAnswer(opt)}
                style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '1.1rem' }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button 
          className="btn btn-secondary"
          onClick={() => { if(window.confirm('Are you sure you want to cancel? Progress will be lost.')) navigate('/exams'); }}
        >
          Cancel Exam
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedAnswer}
          style={{ opacity: selectedAnswer ? 1 : 0.5, minWidth: '150px' }}
        >
          {currentQuestionIdx < exam.questions.length - 1 ? 'Next Question' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default ExamSession;

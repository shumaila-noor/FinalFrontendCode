import { useState } from 'react';
import Interview from './components/interview';
import { interviewAPI } from './services/api';
import './App.css';

function App() {
  const [session, setSession] = useState({
    started: false,
    id: null,
    role: '',
    user_name: '',
    loading: false,
    error: ''
  });

  const handleStartInterview = async (e) => {
    e.preventDefault();
    const role = session.role.trim();
    const user_name = session.user_name.trim();
    if (!role || !user_name) {
      setSession(prev => ({ ...prev, error: 'Please enter a role and user name' }));
      return;
    }

    setSession(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const data = await interviewAPI.startInterview(role, user_name);
      setSession({
        started: true,
        id: data.session_id,
        role: data.role,
        loading: false,
        error: ''
      });
    } catch (error) {
      setSession(prev => ({
        ...prev,
        loading: false,
        error: typeof error === 'string' ? error : 'Failed to start interview'
      }));
    }
  };

  const handleEndInterview = () => {
    setSession({
      started: false,
      id: null,
      role: '',
      loading: false,
      error: ''
    });
  };

  if (!session.started) {
    return (
      <div className="app">
        <div className="start-card">
          <h1>🎯 AI Interview System</h1>
          <p className="subtitle">Practice interviews with AI feedback</p>
          
          <form onSubmit={handleStartInterview} className="start-form">
            <div className="input-group">
    <label htmlFor="user_name">Full Name</label>
    <input
      type="text"
      id="user_name"
      value={session.user_name}
      // Jab user yahan type karega, to state update hogi
      onChange={(e) => setSession(prev => ({ ...prev, user_name: e.target.value, error: '' }))}
      placeholder="Enter your name"
      disabled={session.loading}
    />
  </div>
            <div className="input-group">
              <label htmlFor="role">What role are you applying for?</label>
              <input
                type="text"
                id="role"
                value={session.role}
                onChange={(e) => setSession(prev => ({ ...prev, role: e.target.value, error: '' }))}
                placeholder="e.g., Full Stack Developer, Data Scientist"
                disabled={session.loading}
                autoFocus
              />
              {session.error && <span className="error">{session.error}</span>}
            </div>
            
            <button 
              type="submit" 
              className="start-btn"
              disabled={session.loading}
            >
              {session.loading ? (
                <>
                  <span className="spinner"></span>
                  Starting...
                </>
              ) : (
                'Start Interview →'
              )}
            </button>
          </form>

          <div className="features">
            <div className="feature">
              <span>🎤</span>
              <p>Voice Input</p>
            </div>
            <div className="feature">
              <span>📝</span>
              <p>Text Input</p>
            </div>
            <div className="feature">
              <span>🤖</span>
              <p>AI Feedback</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Interview 
      sessionId={session.id}
      role={session.role}
      onEnd={handleEndInterview}
    />
  );
}

export default App;
import { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';

const Interview = ({ role, onEnd }) => {
  const [interviewState, setInterviewState] = useState({
    currentQuestion: 'Loading...',
    answer: '',
    loading: false,
  });
  <h1>TEST</h1>
  const [userId, setUserId] = useState(null); // Backend se aane wali ID yahan save hogi

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // 1. Backend se start interview call karke ID mangwa rahay hain
        const data = await interviewAPI.startInterview(role);
        if (isMounted) {
          console.log("Backend ID Received:", data.user_id);
          setUserId(data.user_id); // 🎯 Yahan data.user_id save ho raha hai
          setInterviewState(p => ({ ...p, currentQuestion: data.question }));
        }
      } catch (err) {
        console.error("Start failed", err);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Agar userId (UserInfoId) nahi mili to submit nahi hoga
    if (!userId) {
      alert("System not ready. User ID missing. Please refresh.");
      return;
    }

    setInterviewState(p => ({ ...p, loading: true }));
    try {
      // 2. API ko wahi userId bhej rahay hain jo start mein mili thi
      const data = await interviewAPI.submitTextAnswer(
        userId, 
        interviewState.answer, 
        role, 
        interviewState.currentQuestion
      );

      // Agla sawal update kar rahay hain
      setInterviewState(p => ({
        ...p,
        currentQuestion: data.next_question,
        answer: '',
        loading: false
      }));
    } catch (err) {
      setInterviewState(p => ({ ...p, loading: false }));
      alert("Submit failed! Check if backend is running.");
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      {/* 🟢 Screen par check karne ke liye ke ID aa gayi hai ya nahi */}
      <p style={{ color: userId ? 'green' : 'red', fontWeight: 'bold' }}>
        Status: {userId ? `✅ Connected (ID: ${userId})` : '❌ Connecting to Database...'}
      </p>
      
      <h3>Question:</h3>
      <p style={{ fontSize: '1.1rem' }}>{interviewState.currentQuestion}</p>

      <form onSubmit={handleSubmit}>
        <textarea 
          value={interviewState.answer} 
          onChange={(e) => setInterviewState(p => ({ ...p, answer: e.target.value }))}
          style={{ width: '100%', height: '100px', padding: '10px' }}
          placeholder="Type your answer here..."
        />
        <br />
        <button 
          type="submit" 
          disabled={interviewState.loading || !userId}
          style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
        >
          {interviewState.loading ? 'Saving to Database...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};

export default Interview;
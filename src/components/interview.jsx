import { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';

const Interview = ({ role, onEnd }) => {
  const [interviewState, setInterviewState] = useState({
    currentQuestion: 'Loading...',
    answer: '',
    loading: false,
    isRecording: false, // Voice status
  });
  
  const [userId, setUserId] = useState(null);
  const [recorder, setRecorder] = useState(null); // Recorder state

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const data = await interviewAPI.startInterview(role);
        if (isMounted) {
          setUserId(data.user_id);
          setInterviewState(p => ({ ...p, currentQuestion: data.question }));
        }
      } catch (err) { console.error("Start failed", err); }
    };
    init();
    return () => { isMounted = false; };
  }, [role]);

  // 🎙️ Voice Recording Functions
  const handleVoice = async () => {
    if (!interviewState.isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new MediaRecorder(stream);
      const chunks = [];
      newRecorder.ondataavailable = (e) => chunks.push(e.data);
      newRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        submitVoice(blob);
      };
      newRecorder.start();
      setRecorder(newRecorder);
      setInterviewState(p => ({ ...p, isRecording: true }));
    } else {
      recorder.stop();
      setInterviewState(p => ({ ...p, isRecording: false }));
    }
  };

  const submitVoice = async (blob) => {
    setInterviewState(p => ({ ...p, loading: true }));
    try {
      const data = await interviewAPI.submitAudioAnswer(userId, role, interviewState.currentQuestion, blob);
      setInterviewState(p => ({ ...p, currentQuestion: data.next_question, answer: '', loading: false }));
    } catch (err) {
      setInterviewState(p => ({ ...p, loading: false }));
      alert("Voice submission failed!");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userId) return alert("System not ready.");

    setInterviewState(p => ({ ...p, loading: true }));
    try {
      const data = await interviewAPI.submitTextAnswer(userId, interviewState.answer, role, interviewState.currentQuestion);
      setInterviewState(p => ({ ...p, currentQuestion: data.next_question, answer: '', loading: false }));
    } catch (err) {
      setInterviewState(p => ({ ...p, loading: false }));
      alert("Submit failed!");
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <p style={{ color: userId ? 'green' : 'red', fontWeight: 'bold' }}>
        Status: {userId ? ` Connected (ID: ${userId})` : ' Connecting...'}
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
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" disabled={interviewState.loading || !userId}>
            {interviewState.loading ? 'Saving...' : 'Submit Text'}
          </button>

          {/* 🎙️ Voice Button */}
          <button type="button" onClick={handleVoice} style={{ background: interviewState.isRecording ? 'red' : '#ddd' }}>
            {interviewState.isRecording ? 'Stop Recording' : '🎙️ Answer with Voice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Interview;
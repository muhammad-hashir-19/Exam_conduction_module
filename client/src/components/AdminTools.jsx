import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AdminTools = () => {
  const { exams, generateAIQuestions } = useAppContext();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const uniqueSkills = Array.from(new Set(exams.map(e => JSON.stringify(e.skill))))
    .map(s => JSON.parse(s))
    .filter(s => s !== null);

  const handleGenerate = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    setSuccess(false);
    
    const result = await generateAIQuestions(selectedSkill, count);
    
    setLoading(false);
    if (result && !result.error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="card glass-panel mb-8 border-primary" style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={24} className="text-primary" />
        <h3 style={{ margin: 0 }}>AI Question Generator (Admin Only)</h3>
      </div>
      
      <p className="text-muted mb-4">Select a skill to generate new multiple-choice questions using Groq AI.</p>
      
      <div className="flex gap-4 items-end flex-wrap">
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="form-label">Target Skill</label>
          <select 
            className="form-input" 
            value={selectedSkill} 
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">Select a skill...</option>
            {uniqueSkills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '100px' }}>
          <label className="form-label">Count</label>
          <input 
            type="number" 
            className="form-input" 
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value))} 
            min="1" max="10"
          />
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading || !selectedSkill}
          className="btn btn-primary flex items-center gap-2"
          style={{ height: '42px' }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {success && (
        <div className="mt-4 flex items-center gap-2 text-success animate-fade-in">
          <CheckCircle2 size={18} />
          <span>Questions and Exams successfully generated via Groq AI!</span>
        </div>
      )}
    </div>
  );
};

export default AdminTools;

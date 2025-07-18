import React, { useState, useEffect } from 'react';
import axios from 'axios';


const LogForm = ({ onLog }) => {
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (food.length > 2) {
      setLoading(true);
      axios.post('http://localhost:5000/api/usdaSearch', { query: food })
        .then(res => {
          setSuggestions(res.data); // already formatted by backend
        })
        .catch(err => console.error('Proxy error:', err))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, 500);

  return () => clearTimeout(delayDebounce);
}, [food]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!food || !calories) return;

    try {
      await axios.post('http://localhost:5000/api/logFood', {
        food,
        calories: parseInt(calories)
      });

      onLog();
      setFood('');
      setCalories('');
      setSuggestions([]);
    } catch (err) {
      console.error('Log error:', err);
    }
  };

  const handleSuggestionClick = (item) => {
    setFood(item.name);
    setCalories(item.calories || '');
    setSuggestions([]);
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif',
      color: '#333'
    }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Log a Food Item</h2>

        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Food Name</label>
        <input
          type="text"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            width: '100%',
            marginBottom: '0.75rem',
            boxSizing: 'border-box'
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Calories</label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            width: '100%',
            marginBottom: '0.75rem',
            boxSizing: 'border-box'
          }}
        />

        <button type="submit" style={{
          padding: '0.6rem',
          width: '100%',
          borderRadius: '4px',
          border: 'none',
          background: '#2e7d32',
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Submit Entry
        </button>

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1rem 0'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #ccc',
              borderTop: '3px solid #2e7d32',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        )}

        {suggestions.length > 0 && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '1rem 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #eee',
                  background: '#f9f9f9',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                {item.name} {item.calories ? `— ${item.calories} kcal` : ''}
              </li>
            ))}
          </ul>
        )}
      </form>

      <style>
        {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
      </style>
    </div>
  );
};

export default LogForm;
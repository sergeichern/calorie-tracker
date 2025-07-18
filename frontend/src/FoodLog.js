import React from 'react';
import axios from 'axios';

const FoodLog = ({ entries, onDelete }) => {
  if (entries.length === 0) {
    return <p style={{ marginTop: '2rem' }}>No food logged today yet 🕒</p>;
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/food/${id}`);
      onDelete(); // Refresh the log after deletion
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>🧾 Today's Food Log</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {[...entries]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((item) => {
            const localTime = new Date(new Date(item.timestamp).getTime() - 4 * 60 * 60 * 1000);
            const formattedTime = localTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{item.food}</strong> — {item.calories} kcal
                <span style={{ color: '#888', marginLeft: '1rem' }}>
                  ({formattedTime})
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    marginLeft: '1rem',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default FoodLog;
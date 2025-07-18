import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LogForm from './LogForm';
import FoodLog from './FoodLog';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, target: 2000, percent: 0 });
  const [entries, setEntries] = useState([]);

  // Fetch stats
  const fetchStats = () => {
    axios.get('http://localhost:5000/api/todayStats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching stats:', err));
  };

  // Fetch food log
  const fetchLog = () => {
    axios.get('http://localhost:5000/api/today')
      .then(res => setEntries(res.data))
      .catch(err => console.error('Error fetching log:', err));
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchLog();
  }, []);

  // Refresh both after log/delete
  const refreshAll = () => {
    fetchStats();
    fetchLog();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Daily Calorie Tracker</h2>

      {/* Food logging form */}
      <LogForm onLog={refreshAll} />

      {/* Stats display */}
      <p><strong>Goal:</strong> {stats.target} kcal</p>
      <p><strong>Consumed:</strong> {stats.total} kcal</p>
      <p><strong>Progress:</strong> {stats.percent}%</p>

      {/* Animated progress bar */}
      <div style={{
        background: '#eee',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '25px',
        width: '100%',
        marginTop: '1rem'
      }}>
        <div style={{
          height: '100%',
          width: `${stats.percent}%`,
          background: stats.percent < 100 ? '#4caf50' : '#f44336',
          transition: 'width 0.6s ease-out'
        }} />
      </div>

      {/* Live food log viewer */}
      <FoodLog entries={entries} onDelete={refreshAll} />
    </div>
  );
};

export default Dashboard;
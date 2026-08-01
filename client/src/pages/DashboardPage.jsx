// client/src/pages/DashboardPage.jsx - Historical task stats
import React, { useState, useEffect } from 'react';
import { getAllPlans } from '../api';

function DashboardPage() {
  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await getAllPlans();
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculations
  const totalTasks = plans.reduce((sum, p) => sum + (p.plan_items?.length || 0), 0);
  const doneTasks = plans.reduce((sum, p) => {
    if (!p.plan_items) return sum;
    return sum + p.plan_items.filter(i => i.done).length;
  }, 0);
  // 防止除0NaN
  const avgPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Find selected plan details
  const selectedPlan = plans.find(p => p.plan_date === selectedDate);

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>加载中...</div>;
  }

  return (
    <div>
      <div className="page-title">📊 数据看板</div>

      {/* Stats overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{plans.length}</div>
          <div className="stat-label">记录天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalTasks}</div>
          <div className="stat-label">总任务数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avgPercent}%</div>
          <div className="stat-label">平均完成率</div>
        </div>
      </div>

      {/* Date picker */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#555' }}>选择日期</span>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">-- 选择日期 --</option>
          {plans.map(p => (
            <option key={p.plan_date} value={p.plan_date}>{p.plan_date}</option>
          ))}
        </select>
      </div>

      {/* Selected date detail */}
      {selectedPlan && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            📅 {selectedPlan.plan_date} 的任务详情
          </h3>
          <div style={{ marginBottom: '0.8rem' }}>
            <span style={{ color: '#555', fontSize: '0.9rem' }}>
              共 {selectedPlan.plan_items.length} 项，已完成 {selectedPlan.plan_items.filter(i => i.done).length} 项
            </span>
          </div>
          <div className="progress-bar-container" style={{ marginBottom: '1rem' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${(() => {
                  const len = selectedPlan.plan_items.length;
                  const done = selectedPlan.plan_items.filter(i => i.done).length;
                  return len > 0 ? Math.round((done / len) * 100) : 0;
                })()}%`,
              }}
            ></div>
          </div>
          {selectedPlan.plan_items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: item.done ? '2px solid #667eea' : '2px solid #ccc',
                  background: item.done ? '#667eea' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginRight: '0.6rem',
                }}
              >
                {item.done && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
              </span>
              <span style={{
                textDecoration: item.done ? 'line-through' : 'none',
                color: item.done ? '#aaa' : '#333',
              }}>
                {item.name}
              </span>
              <span className={`tag tag-${item.type}`} style={{ marginLeft: 'auto' }}>
                {item.type === 'main' ? '主要' : '次要'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* History table */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📋 历史记录</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>总任务</th>
                <th>已完成</th>
                <th>完成率</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => {
                const total = plan.plan_items?.length || 0;
                const done = plan.plan_items?.filter(i => i.done).length || 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <tr key={plan.plan_date}>
                    <td>{plan.plan_date}</td>
                    <td>{total}</td>
                    <td>{done}</td>
                    <td>
                      <span style={{
                        color: pct >= 80 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#f44336',
                        fontWeight: 600,
                      }}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
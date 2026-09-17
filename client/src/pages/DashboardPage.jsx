// client/src/pages/DashboardPage.jsx - Historical task stats dashboard
import React, { useState, useEffect } from 'react';
import { getAllPlans, deletePlanByDate } from '../api';

function DashboardPage() {
  const [plans, setPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  // History table sort + pagination state
  const [historySort, setHistorySort] = useState({ key: 'plan_date', dir: 'desc' });
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;

  // Deleting state
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await getAllPlans();
      if (res.data.success) {
        setPlans(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Stats calculations ---
  const totalTasks = plans.reduce((sum, p) => sum + (Array.isArray(p.plan_items) ? p.plan_items.length : 0), 0);
  const doneTasks = plans.reduce((sum, p) => {
    if (!Array.isArray(p.plan_items)) return sum;
    return sum + p.plan_items.filter(i => i.done).length;
  }, 0);
  const avgPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Main tasks vs relax tasks
  const mainTotal = plans.reduce((sum, p) => {
    if (!Array.isArray(p.plan_items)) return sum;
    return sum + p.plan_items.filter(i => i.type === 'main').length;
  }, 0);
  const mainDone = plans.reduce((sum, p) => {
    if (!Array.isArray(p.plan_items)) return sum;
    return sum + p.plan_items.filter(i => i.type === 'main' && i.done).length;
  }, 0);
  const relaxTotal = plans.reduce((sum, p) => {
    if (!Array.isArray(p.plan_items)) return sum;
    return sum + p.plan_items.filter(i => i.type === 'relax').length;
  }, 0);
  const relaxDone = plans.reduce((sum, p) => {
    if (!Array.isArray(p.plan_items)) return sum;
    return sum + p.plan_items.filter(i => i.type === 'relax' && i.done).length;
  }, 0);

  const plansWithStats = plans.map(p => {
    const items = Array.isArray(p.plan_items) ? p.plan_items : [];
    const total = items.length;
    const done = items.filter(i => i.done).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...p, total, done, pct };
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Split records:
  // - historyPlans: completion rate > 0 (used by worst days & history table)
  // - zeroPlans: completion rate = 0, excluding today (display & batch delete)
  const historyPlans = plansWithStats.filter(p => p.pct > 0);
  const zeroPlans = plansWithStats.filter(p => p.pct === 0 && p.plan_date !== todayStr);

  // History table sort + pagination (derived from historyPlans)
  const sortedHistory = [...historyPlans].sort((a, b) => {
    let cmp = 0;
    if (historySort.key === 'plan_date') {
      cmp = a.plan_date.localeCompare(b.plan_date);
    } else if (historySort.key === 'pct') {
      cmp = a.pct - b.pct;
    }
    return historySort.dir === 'asc' ? cmp : -cmp;
  });
  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / historyPageSize));
  const currentPage = Math.min(historyPage, totalPages);
  const pagedHistory = sortedHistory.slice((currentPage - 1) * historyPageSize, currentPage * historyPageSize);
  const handleHistorySort = (key) => {
    setHistorySort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    setHistoryPage(1);
  };

  const bestDays = [...plansWithStats].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const worstDays = [...plansWithStats].filter(p => p.pct > 0).sort((a, b) => a.pct - b.pct).slice(0, 3);

  // Consecutive days (streak): find the longest consecutive streak ending today or recently
  const sortedDates = [...new Set(plans.map(p => p.plan_date))].sort().reverse();
  let streak = 0;
  if (sortedDates.length > 0) {
    let expectedDate = todayStr;
    for (const d of sortedDates) {
      if (d === expectedDate) {
        streak++;
        // go to previous day
        const prev = new Date(expectedDate);
        prev.setDate(prev.getDate() - 1);
        expectedDate = prev.toISOString().split('T')[0];
      } else if (streak > 0) {
        break;
      }
    }
  }

  // Find selected plan details
  const selectedPlan = plans.find(p => p.plan_date === selectedDate);

  // --- Delete handlers ---
  const handleDeletePlan = async (date) => {
    if (!confirm(`确定删除 ${date} 的记录？此操作不可恢复。`)) return;
    setDeleting(true);
    try {
      await deletePlanByDate(date);
      await loadPlans();
    } catch (err) {
      console.error('Delete plan failed:', err);
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllZero = async () => {
    if (zeroPlans.length === 0) return;
    if (!confirm(`确定批量删除全部 ${zeroPlans.length} 条完成率为 0 的记录？此操作不可恢复（已排除当天记录）。`)) return;
    setDeleting(true);
    try {
      await Promise.all(zeroPlans.map(p => deletePlanByDate(p.plan_date)));
      await loadPlans();
    } catch (err) {
      console.error('Batch delete failed:', err);
      alert('批量删除部分失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  // --- Mini bar chart data: last 7 days trend ---
  const getLast7DaysData = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const plan = plans.find(p => p.plan_date === dateStr);
      if (plan) {
        const items = Array.isArray(plan.plan_items) ? plan.plan_items : [];
        const total = items.length;
        const done = items.filter(it => it.done).length;
        result.push({ date: dateStr, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 });
      } else {
        result.push({ date: dateStr, total: 0, done: 0, pct: 0 });
      }
    }
    return result;
  };
  const last7Days = getLast7DaysData();

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>加载中...</div>;
  }

  // Empty state
  if (plans.length === 0) {
    return (
      <div>
        <div className="page-title">📊 数据看板</div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <div style={{ fontSize: '1.1rem', color: '#888' }}>暂无数据</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>
            请先在「今日任务」页面完成任务，这里会自动展示统计数据。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">📊 数据看板</div>

      {/* Stats overview */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
        <div className="stat-card">
          <div className="stat-number">{streak} 🔥</div>
          <div className="stat-label">连续打卡</div>
        </div>
      </div>

      {/* Task type breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#555' }}>🎯 主任务完成</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a73e8' }}>{mainDone}</span>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>完成 {mainDone} / {mainTotal} 项</div>
              <div className="progress-bar-container" style={{ marginTop: '0.5rem' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${mainTotal > 0 ? Math.round((mainDone / mainTotal) * 100) : 0}%`,
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#555' }}>🌿 休闲任务完成</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#e8a838' }}>{relaxDone}</span>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>完成 {relaxDone} / {relaxTotal} 项</div>
              <div className="progress-bar-container" style={{ marginTop: '0.5rem' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${relaxTotal > 0 ? Math.round((relaxDone / relaxTotal) * 100) : 0}%`,
                    background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last 7 days trend - mini bar chart */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#555' }}>📈 最近 7 天趋势</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', padding: '0 0.5rem' }}>
          {last7Days.map((day) => {
            const maxBarHeight = 100; // px
            const barHeight = day.total > 0 ? Math.max(2, (day.pct / 100) * maxBarHeight) : 2;
            const barColor = day.pct >= 80 ? '#4caf50' : day.pct >= 50 ? '#ff9800' : day.pct > 0 ? '#f44336' : '#e0e0e0';
            return (
              <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>{day.pct}%</span>
                <div
                  style={{
                    width: '30px',
                    height: `${barHeight}px`,
                    background: barColor,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                  title={`${day.date}: ${day.done}/${day.total}`}
                ></div>
                <span style={{ fontSize: '0.72rem', color: '#999', marginTop: '6px' }}>{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best / worst days */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.8rem', color: '#4caf50' }}>🏆 完成率最高</h3>
          {bestDays.map((d, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: '0.9rem' }}>{d.plan_date}</span>
              <span style={{ fontWeight: 600, color: '#4caf50' }}>{d.pct}% ({d.done}/{d.total})</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.8rem', color: '#f44336' }}>⚠️ 完成率最低</h3>
          {worstDays.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '1.5rem', fontSize: '0.9rem' }}>
              暂无数据（已完成记录不足）
            </div>
          ) : (
            worstDays.map((d, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '0.9rem' }}>{d.plan_date}</span>
                <span style={{ fontWeight: 600, color: '#f44336' }}>{d.pct}% ({d.done}/{d.total})</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Date picker */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
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
      {selectedPlan && Array.isArray(selectedPlan.plan_items) && (
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

      {/* History table (excludes 0% records) */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          📋 历史记录
          <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem', fontWeight: 400 }}>
            共 {sortedHistory.length} 条（不含完成率 0%）
          </span>
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  onClick={() => handleHistorySort('plan_date')}
                  title="点击按日期排序"
                >
                  日期 {historySort.key === 'plan_date' ? (historySort.dir === 'asc' ? '↑' : '↓') : '↕'}
                </th>
                <th>总任务</th>
                <th>已完成</th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  onClick={() => handleHistorySort('pct')}
                  title="点击按完成率排序"
                >
                  完成率 {historySort.key === 'pct' ? (historySort.dir === 'asc' ? '↑' : '↓') : '↕'}
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>
                    暂无记录
                  </td>
                </tr>
              ) : (
                pagedHistory.map(plan => (
                  <tr key={plan.plan_date}>
                    <td>{plan.plan_date}</td>
                    <td>{plan.total}</td>
                    <td>{plan.done}</td>
                    <td>
                      <span style={{
                        color: plan.pct >= 80 ? '#4caf50' : plan.pct >= 50 ? '#ff9800' : '#f44336',
                        fontWeight: 600,
                      }}>
                        {plan.pct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#888' }}>
            第 {currentPage} / {totalPages} 页 · 每页 {historyPageSize} 条
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className="btn btn-sm"
              style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
              onClick={() => setHistoryPage(1)}
              disabled={currentPage === 1}
            >« 首页</button>
            <button
              className="btn btn-sm"
              style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
              onClick={() => setHistoryPage(currentPage - 1)}
              disabled={currentPage === 1}
            >‹ 上一页</button>
            <button
              className="btn btn-sm"
              style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
              onClick={() => setHistoryPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >下一页 ›</button>
            <button
              className="btn btn-sm"
              style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
              onClick={() => setHistoryPage(totalPages)}
              disabled={currentPage === totalPages}
            >末页 »</button>
          </div>
        </div>
      </div>

      {/* Zero-completion records (excludes today) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>
            📭 完成率为 0 的记录
            <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem', fontWeight: 400 }}>
              {zeroPlans.length} 条（已排除当天）
            </span>
          </h3>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDeleteAllZero}
            disabled={zeroPlans.length === 0 || deleting}
          >
            🗑 批量删除
          </button>
        </div>
        {zeroPlans.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '1.5rem', fontSize: '0.9rem' }}>
            暂无完成率为 0 的记录 🎉
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>任务数</th>
                  <th>完成率</th>
                  <th style={{ textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {zeroPlans.map(plan => (
                  <tr key={plan.plan_date}>
                    <td>{plan.plan_date}</td>
                    <td>{plan.done} / {plan.total}</td>
                    <td>
                      <span style={{ color: '#f44336', fontWeight: 600 }}>0%</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeletePlan(plan.plan_date)}
                        disabled={deleting}
                      >删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;

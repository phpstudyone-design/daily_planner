import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayPlan, updatePlanItems, getAllTasks, createTaskApi } from '../api';

function IndexPage() {
  const [tasks, setTasks] = useState([]);
  const [planDate, setPlanDate] = useState('');
  const [allTasksPool, setAllTasksPool] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState('main');
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadPool() {
      try {
        const res = await getAllTasks();
        if (res.data.success) setAllTasksPool(res.data.data);
      } catch (err) { console.error(err); }
    }
    loadPool();
  }, []);

  useEffect(() => {
    async function loadPlan() {
      try {
        setLoading(true);
        const res = await getTodayPlan();
        if (res.data.success) {
          setTasks(res.data.data.plan_items || []);
          const rawDate = res.data.data.plan_date;
          setPlanDate(typeof rawDate === "string" ? rawDate.split("T")[0] : new Date(rawDate).toISOString().split("T")[0]);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadPlan();
  }, []);

  const toggleTask = useCallback(async (index) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], done: !updated[index].done };
    setTasks(updated);
    try { await updatePlanItems(planDate, updated); }
    catch (err) { console.error(err); setTasks(tasks); }
  }, [tasks, planDate]);

  const persistTasks = useCallback(async (updatedTasks) => {
    try { await updatePlanItems(planDate, updatedTasks); }
    catch (err) { console.error(err); }
  }, [planDate]);

  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index); };
  const handleDrop = (e) => e.preventDefault();

  const handleDragEnd = async () => {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null); setDragOverIndex(null); return;
    }
    const updated = [...tasks];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dragOverIndex, 0, moved);
    updated.forEach((item, idx) => { item.order = idx; });
    setTasks(updated); setDragIndex(null); setDragOverIndex(null);
    await persistTasks(updated);
  };

  const addExistingTask = async (task) => {
    const updated = [...tasks];
    updated.push({ id: task.id, name: task.name, type: task.task_type, done: false, order: updated.length });
    setTasks(updated); setShowAddDropdown(false); await persistTasks(updated);
  };

  const createAndAddTask = async () => {
    if (!newTaskName.trim()) return;
    if (allTasksPool.find(t => t.name.toLowerCase() === newTaskName.trim().toLowerCase())) { alert('任务已存在'); return; }
    try {
      const res = await createTaskApi({ name: newTaskName.trim(), task_type: newTaskType });
      if (res.data.success) {
        setAllTasksPool([...allTasksPool, res.data.data]);
        const updated = [...tasks];
        updated.push({ id: res.data.data.id, name: res.data.data.name, type: res.data.data.task_type, done: false, order: updated.length });
        setTasks(updated); setNewTaskName(''); setShowAddDropdown(false); await persistTasks(updated);
      }
    } catch (err) { console.error(err); }
  };

  const filteredPoolTasks = allTasksPool.filter(t => !newTaskName.trim() && t.name.toLowerCase().includes(newTaskName.toLowerCase()));

  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>加载中...</div>;

  return (
    <div>
      <div className="page-title">{'\ud83d\udcc5'} 今日任务</div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: '#888', minWidth: '120px' }}>完成率 {doneCount}/{totalCount}</span>
        <div className="progress-bar-container" style={{ flex: 1 }}>
          <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
        </div>
        <span style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: 600 }}>{percent}%</span>
      </div>
      <div className="card" style={{ padding: '0' }}>
        {tasks.map((task, index) => (
          <div key={`${task.id}-${index}`} draggable onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)} onDrop={handleDrop} onDragEnd={handleDragEnd}
            className={dragOverIndex === index ? 'drag-over' : ''}
            style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1.2rem', borderBottom: '1px solid #f0f0f0', cursor: 'grab', opacity: dragIndex === index ? 0.5 : 1 }}>
            <span style={{ marginRight: '0.8rem', color: '#ccc', fontSize: '1.2rem' }}>&#9776;</span>
            <div onClick={() => toggleTask(index)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: task.done ? '2px solid #667eea' : '2px solid #ccc', background: task.done ? '#667eea' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {task.done && <span style={{ color: '#fff', fontSize: '14px' }}>&#10003;</span>}
            </div>
            <div style={{ marginLeft: '0.8rem', flex: 1 }}>
              <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#aaa' : '#333', fontSize: '0.95rem' }}>{task.name}</span>
              <span className={`tag tag-${task.type}`} style={{ marginLeft: '0.6rem' }}>{task.type === 'main' ? '主任务' : '休闲'}</span>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>暂无任务</div>}
      </div>
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.8rem', color: '#555' }}>+ 添加任务</h3>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <input type="text" placeholder="搜索或输入新任务名称..." value={newTaskName}
            onChange={(e) => { setNewTaskName(e.target.value); setShowAddDropdown(true); }}
            onFocus={() => setShowAddDropdown(true)}
            onBlur={(e) => {
              if (e.relatedTarget && dropdownRef.current?.contains(e.relatedTarget)) return;
              setTimeout(() => setShowAddDropdown(false), 200);
            }}
            style={{ width: '100%', padding: '0.6rem 0.8rem' }} />
          {showAddDropdown && (filteredPoolTasks.length > 0 || newTaskName.trim()) && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '300px', overflowY: 'auto' }}>
              {filteredPoolTasks.map(task => (
                <div key={task.id} onClick={() => addExistingTask(task)} style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{task.name}</span>
                  <span className={`tag tag-${task.task_type}`}>{task.task_type === 'main' ? '主任务' : '休闲'}</span>
                </div>
              ))}
              {newTaskName.trim() && !allTasksPool.find(t => t.name.toLowerCase() === newTaskName.trim().toLowerCase()) && (
                <div style={{ border: 'none' }}>
                  <div style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#999' }}>任务不存在，创建新任务：</div>
                  <div style={{ padding: '0.6rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>{newTaskName}</span>
                    <select value={newTaskType} onChange={(e) => setNewTaskType(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ fontSize: '0.8rem' }}>
                      <option value="main">主任务</option>
                      <option value="relax">休闲副任务</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => createAndAddTask()}>创建并添加</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndexPage;
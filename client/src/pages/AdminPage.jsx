// client/src/pages/AdminPage.jsx - Task pool & template management
import React, { useState, useEffect } from 'react';
import {
  getAllTasks, createTaskApi, updateTaskApi, deleteTaskApi,
  getAllTemplates, createTemplateApi, updateTemplateApi, setDefaultTemplateApi, deleteTemplateApi
} from '../api';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'templates'

  return (
    <div>
      <div className="page-title">⚙️ 管理页面</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className="btn btn-primary"
          style={activeTab !== 'tasks' ? { background: '#fff', color: '#333', border: '1px solid #ddd' } : {}}
          onClick={() => setActiveTab('tasks')}
        >
          📝 任务池管理
        </button>
        <button
          className="btn btn-primary"
          style={activeTab !== 'templates' ? { background: '#fff', color: '#333', border: '1px solid #ddd' } : {}}
          onClick={() => setActiveTab('templates')}
        >
          🧩 模板管理
        </button>
      </div>

      {activeTab === 'tasks' && <TaskPoolManagement />}
      {activeTab === 'templates' && <TemplateManagement />}
    </div>
  );
}

// ============ Task Pool Management ============
function TaskPoolManagement() {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('main');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('main');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await getAllTasks();
      if (res.data.success) setTasks(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createTaskApi({ name: newName.trim(), task_type: newType });
      setNewName('');
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditType(task.task_type);
  };

  const handleUpdate = async () => {
    try {
      await updateTaskApi(editingId, { name: editName.trim(), task_type: editType });
      setEditingId(null);
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除该任务？')) return;
    try {
      await deleteTaskApi(id);
      loadTasks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="card">
      {/* Create new task */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="新任务名称"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="main">主要任务</option>
          <option value="relax">休闲任务</option>
        </select>
        <button className="btn btn-primary" onClick={handleCreate}>➕ 新增</button>
      </div>

      {/* Task list */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>任务名称</th>
            <th>类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>
                {editingId === task.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  task.name
                )}
              </td>
              <td>
                {editingId === task.id ? (
                  <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                    <option value="main">主要任务</option>
                    <option value="relax">休闲任务</option>
                  </select>
                ) : (
                  <span className={`tag tag-${task.task_type}`}>
                    {task.task_type === 'main' ? '主要' : '休闲'}
                  </span>
                )}
              </td>
              <td>
                {editingId === task.id ? (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="btn btn-success btn-sm" onClick={handleUpdate}>保存</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setEditingId(null)}>取消</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => startEdit(task)}>编辑</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>删除</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ Template Management ============
function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTaskIds, setEditTaskIds] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [tmplRes, taskRes] = await Promise.all([getAllTemplates(), getAllTasks()]);
      if (tmplRes.data.success) setTemplates(tmplRes.data.data);
      if (taskRes.data.success) setAllTasks(taskRes.data.data);
    } catch (err) { console.error(err); }
  };

  const mainTasks = allTasks.filter(t => t.task_type === 'main');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createTemplateApi({ name: newName.trim(), task_ids: [] });
      setNewName('');
      loadAll();
    } catch (err) { console.error(err); }
  };

  const startEdit = (tmpl) => {
    setEditingId(tmpl.id);
    setEditName(tmpl.name);
    setEditTaskIds(tmpl.task_ids || []);
  };

  const handleUpdate = async () => {
    try {
      await updateTemplateApi(editingId, { name: editName.trim(), task_ids: editTaskIds });
      setEditingId(null);
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultTemplateApi(id);
      loadAll();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除该模板？')) return;
    try {
      await deleteTemplateApi(id);
      loadAll();
    } catch (err) { console.error(err); }
  };

  // Move task in edit list up/down
  const moveTask = (index, direction) => {
    const newIds = [...editTaskIds];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;
    [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
    setEditTaskIds(newIds);
  };

  const addTaskToTemplate = (taskId) => {
    setEditTaskIds([...editTaskIds, taskId]);
  };

  const removeTaskFromTemplate = (taskId) => {
    setEditTaskIds(editTaskIds.filter((id, i) => !(id === taskId && editTaskIds.indexOf(id) === i)));
  };

  return (
    <div className="card">
      {/* Create new template */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="新模板名称"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button className="btn btn-primary" onClick={handleCreate}>➕ 新建模板</button>
      </div>

      {/* Templates list */}
      {templates.map(tmpl => (
        <div key={tmpl.id} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div>
              {editingId === tmpl.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
              ) : (
                <strong>{tmpl.name}</strong>
              )}
              {tmpl.is_default && <span className="tag tag-main" style={{ marginLeft: '0.5rem' }}>默认模板</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {!tmpl.is_default && (
                <button className="btn btn-success btn-sm" onClick={() => handleSetDefault(tmpl.id)}>设为默认</button>
              )}
              {editingId === tmpl.id ? (
                <>
                  <button className="btn btn-success btn-sm" onClick={handleUpdate}>保存</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setEditingId(null)}>取消</button>
                </>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => startEdit(tmpl)}>编辑</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tmpl.id)}>删除</button>
            </div>
          </div>

          {/* Editing task order */}
          {editingId === tmpl.id && (
            <div>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                模板内主要任务顺序（上下调整）：
              </div>

              {/* Task list with reordering */}
              {editTaskIds.map((taskId, idx) => {
                const task = allTasks.find(t => t.id === taskId);

                return (
                  <div key={taskId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
                      onClick={() => moveTask(idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#f0f0f0', border: '1px solid #ddd' }}
                      onClick={() => moveTask(idx, 1)}
                      disabled={idx === editTaskIds.length - 1}
                    >
                      ↓
                    </button>
                    <span style={{ flex: 1 }}>{task?.name || `任务#${taskId}`}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeTaskFromTemplate(taskId)}>移除</button>
                  </div>
                );
              })}

              {/* Add main tasks */}
              <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addTaskToTemplate(Number(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="">+ 添加主要任务</option>
                  {mainTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Display task order when not editing */}
          {editingId !== tmpl.id && tmpl.task_ids && tmpl.task_ids.length > 0 && (
            <div style={{ fontSize: '0.9rem', color: '#555' }}>
              任务顺序：
              {(tmpl.task_ids || []).map((id, idx) => {
                const task = allTasks.find(t => t.id === id);
                return (
                  <span key={idx}>
                    {idx > 0 && ' → '}
                    {task?.name || `任务#${id}`}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {templates.length === 0 && (
        <div style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>暂无模板，请新建</div>
      )}
    </div>
  );
}

export default AdminPage;
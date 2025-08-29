import { useEffect, useState } from 'react';
import API from '../utils/axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });

  const load = async () => {
    const { data } = await API.get('/tasks', { params: { status: filter || undefined } });
    setTasks(data);
  };

  useEffect(() => { load(); }, [filter]);

  const create = async (e) => {
    e.preventDefault();
    const { data } = await API.post('/tasks', form);
    setForm({ title: '', description: '', deadline: '' });
    setTasks((t) => [data, ...t]);
  };

  const update = async (id, changes) => {
    const { data } = await API.put(`/tasks/${id}`, changes);
    setTasks((t) => t.map((x) => x._id===id? data : x));
  };

  const remove = async (id) => {
    await API.delete(`/tasks/${id}`);
    setTasks((t) => t.filter((x) => x._id!==id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Capture tasks and track progress</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-900">Create a new task</div>
            <select className="select" value={filter} onChange={(e)=>setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className="input" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
            <input className="input" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
            <input className="input" type="date" value={form.deadline} onChange={(e)=>setForm({...form,deadline:e.target.value})} />
            <button className="btn-primary">Add</button>
          </form>
        </div>

        <div className="space-y-4">
          {tasks.map((t) => (
            <div key={t._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{t.title}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <select className="select" value={t.status} onChange={(e)=>update(t._id,{ status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button className="btn-outline" onClick={()=>remove(t._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;



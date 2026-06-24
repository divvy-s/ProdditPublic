import { useEffect, useState } from 'react';
import API from '../utils/axios';

// ─── Streak helpers ────────────────────────────────────────────────────────────

/**
 * Returns the number of consecutive days (for daily habits) or consecutive
 * weeks (for weekly habits) ending at today.
 *
 * Grace rule: if today isn't checked in yet, we don't break the streak —
 * we start counting from yesterday (day) / last week (weekly) instead.
 * This means the streak only resets the morning after a missed period.
 */
const calculateStreak = (completions = [], frequency = 'daily') => {
  if (!completions.length) return 0;
  return frequency === 'weekly'
    ? calcWeeklyStreak(completions)
    : calcDailyStreak(completions);
};

const calcDailyStreak = (completions) => {
  const dateSet = new Set(
    completions.map((c) => new Date(c.date).toDateString())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Apply grace: start from yesterday if today hasn't been checked in yet
  const cursor = new Date(today);
  if (!dateSet.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dateSet.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const getWeekTimestamp = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // rewind to Sunday
  return d.getTime();
};

const calcWeeklyStreak = (completions) => {
  const weekSet = new Set(
    completions.map((c) => getWeekTimestamp(new Date(c.date)))
  );

  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  let cursor = getWeekTimestamp(new Date());

  // Apply grace: if this week has no check-in, start from last week
  if (!weekSet.has(cursor)) {
    cursor -= MS_PER_WEEK;
  }

  let streak = 0;
  while (weekSet.has(cursor)) {
    streak++;
    cursor -= MS_PER_WEEK;
  }
  return streak;
};

// ─── Components ────────────────────────────────────────────────────────────────

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ title: '', frequency: 'daily' });

  const load = async () => {
    const { data } = await API.get('/habits');
    setHabits(data);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const { data } = await API.post('/habits', form);
    setForm({ title: '', frequency: 'daily' });
    setHabits((h) => [data, ...h]);
  };

  const update = async (id, changes) => {
    const { data } = await API.put(`/habits/${id}`, changes);
    setHabits((h) => h.map((x) => x._id === id ? data : x));
  };

  const remove = async (id) => {
    await API.delete(`/habits/${id}`);
    setHabits((h) => h.filter((x) => x._id !== id));
  };

  const checkIn = async (id) => {
    const { data } = await API.post(`/habits/${id}/checkin`);
    setHabits((h) => h.map((x) => x._id === id ? data : x));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="border rounded p-4">
        <div className="font-semibold mb-3">New Habit</div>
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="select" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <div></div>
          <button className="btn-primary">Add</button>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {habits.map((h) => {
          const streak = calculateStreak(h.completions, h.frequency);
          return (
            <div key={h._id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{h.title}</span>{' '}
                  <span className="text-xs text-gray-500">({h.frequency})</span>
                  {streak > 0 && (
                    <span className="ml-2 text-sm font-medium text-orange-500" title={`${streak}-${h.frequency === 'weekly' ? 'week' : 'day'} streak`}>
                      🔥 {streak}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-outline" onClick={() => checkIn(h._id)}>Check-in ✅</button>
                  <button className="btn-outline" onClick={() => remove(h._id)}>Delete</button>
                </div>
              </div>
              <div className="mt-3">
                <Heatmap completions={h.completions || []} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Heatmap = ({ completions }) => {
  const days = buildRecentDays(56);
  const set = new Set((completions || []).map(c => new Date(c.date).toDateString()));
  return (
    <div className="grid grid-cols-8 gap-1">
      {days.map((d) => {
        const done = set.has(d.date.toDateString());
        return <div key={d.key} title={d.date.toDateString()} className={`w-4 h-4 ${done ? 'bg-green-600' : 'bg-green-200'} rounded-sm`}></div>;
      })}
    </div>
  );
};

const buildRecentDays = (n) => {
  const arr = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push({ key: d.getTime(), date: d });
  }
  return arr.reverse();
};

export default Habits;

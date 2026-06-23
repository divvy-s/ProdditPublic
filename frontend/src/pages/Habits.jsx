import { useEffect, useMemo, useState } from 'react';
import API from '../utils/axios';

/* ─── helpers ─────────────────────────────────────────────────────── */

/** Build an array of the last `n` days, oldest first */
const buildRecentDays = (n) => {
  const arr = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push({ key: d.getTime(), date: d });
  }
  return arr;
};

/** Returns true if the habit has been checked-in today */
const isCheckedInToday = (completions = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return completions.some(
    (c) => new Date(c.date).setHours(0, 0, 0, 0) === today.getTime()
  );
};

/** Calculate current streak (consecutive days ending today or yesterday) */
const calcStreak = (completions = []) => {
  if (!completions.length) return 0;
  const doneSet = new Set(
    completions.map((c) => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(today);
  // if today isn't checked yet, start from yesterday
  if (!doneSet.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (doneSet.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/* ─── Heatmap ──────────────────────────────────────────────────────── */
const Heatmap = ({ completions }) => {
  const days = buildRecentDays(56);
  const doneSet = new Set(
    (completions || []).map((c) => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      {/* Day-of-week labels */}
      <div className="grid grid-cols-8 gap-1 mb-1">
        {weekLabels.map((l, i) => (
          <span
            key={i}
            className="text-[9px] text-center text-gray-400 dark:text-gray-500 font-medium"
          >
            {l}
          </span>
        ))}
        <span /> {/* spacer for 8th col */}
      </div>
      {/* Heatmap grid – 8 cols (7 days + 1 label col would be complex; just 8 cols of days) */}
      <div className="grid grid-cols-8 gap-1">
        {days.map((d) => {
          const done = doneSet.has(d.key);
          const isToday = d.key === today.getTime();
          return (
            <div
              key={d.key}
              title={`${d.date.toDateString()}${done ? ' ✓' : ''}`}
              className={[
                'w-4 h-4 rounded-sm transition-colors duration-200',
                done
                  ? 'bg-green-500 dark:bg-green-400'
                  : 'bg-gray-200 dark:bg-gray-700',
                isToday ? 'ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-gray-800' : '',
              ].join(' ')}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-gray-400">Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
        <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-600" />
        <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400" />
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  );
};

/* ─── HabitCard ────────────────────────────────────────────────────── */
const HabitCard = ({ habit, onCheckIn, onDelete }) => {
  const doneTodayAlready = isCheckedInToday(habit.completions);
  const streak = calcStreak(habit.completions);
  const last7 = buildRecentDays(7);
  const doneSet = new Set(
    (habit.completions || []).map((c) => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  const last7Done = last7.filter((d) => doneSet.has(d.key)).length;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {habit.title}
          </h3>
          <span className="text-xs text-gray-500 capitalize">{habit.frequency}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak badge */}
          {streak > 0 && (
            <span className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              🔥 {streak}d
            </span>
          )}
          {/* Check-in button */}
          <button
            onClick={() => !doneTodayAlready && onCheckIn(habit._id)}
            disabled={doneTodayAlready}
            className={[
              'text-sm px-3 py-1 rounded-lg font-medium transition-all duration-200',
              doneTodayAlready
                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95',
            ].join(' ')}
          >
            {doneTodayAlready ? '✓ Done' : 'Check In'}
          </button>
          <button
            onClick={() => onDelete(habit._id)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Weekly progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>This week</span>
          <span>{last7Done}/7 days</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(last7Done / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap completions={habit.completions} />
    </div>
  );
};

/* ─── Habits page ──────────────────────────────────────────────────── */
const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ title: '', frequency: 'daily' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await API.get('/habits');
      setHabits(data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.post('/habits', form);
      setForm({ title: '', frequency: 'daily' });
      setHabits((h) => [data, ...h]);
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (id) => {
    try {
      const { data } = await API.post(`/habits/${id}/checkin`);
      setHabits((h) => h.map((x) => (x._id === id ? data : x)));
    } catch {}
  };

  const remove = async (id) => {
    try {
      await API.delete(`/habits/${id}`);
      setHabits((h) => h.filter((x) => x._id !== id));
    } catch {}
  };

  const totalDoneToday = habits.filter((h) => isCheckedInToday(h.completions)).length;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 min-h-screen">
      {/* Summary banner */}
      {habits.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              {totalDoneToday} / {habits.length} habits completed today
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              {totalDoneToday === habits.length && habits.length > 0
                ? 'Perfect day! 🎉'
                : 'Keep going!'}
            </p>
          </div>
        </div>
      )}

      {/* Add habit form */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="font-semibold mb-3 text-gray-800 dark:text-gray-100">+ New Habit</div>
        <form onSubmit={create} className="flex flex-wrap gap-2">
          <input
            className="input flex-1 min-w-[160px]"
            placeholder="e.g. Read for 20 minutes"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="select"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <button className="btn-primary" disabled={loading || !form.title.trim()}>
            {loading ? 'Adding…' : 'Add Habit'}
          </button>
        </form>
      </div>

      {/* Habit cards */}
      {habits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌟</p>
          <p className="font-medium">No habits yet — add one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => (
            <HabitCard
              key={h._id}
              habit={h}
              onCheckIn={checkIn}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Habits;

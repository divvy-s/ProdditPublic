import { useEffect, useMemo, useState } from 'react';
import API from '../utils/axios';
import { getSocket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';

const StudyRoom = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [active, setActive] = useState(null);
  const [times, setTimes] = useState([]);
  const token = useMemo(() => localStorage.getItem('token'), []);
  const socket = useMemo(() => getSocket(token), [token]);

  useEffect(() => {
    const load = async () => {
      const { data } = await API.get('/studyrooms');
      setRooms(data);
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    if (!active) return;
    socket.emit('room:join', active._id);
    const tick = async () => {
      const { data } = await API.get(`/studyrooms/${active._id}/active-times`);
      setTimes(data);
    };
    tick();
    const interval = setInterval(tick, 3000);
    const onPresence = () => tick();
    socket.on('room:presence', onPresence);
    return () => {
      socket.emit('room:leave', active._id);
      socket.off('room:presence', onPresence);
      clearInterval(interval);
    };
  }, [active, socket]);

  const join = async (room) => {
    await API.post(`/studyrooms/${room._id}/join`);
    setActive(room);
  };

  const leave = async () => {
    if (!active) return;
    try {
      await API.post(`/studyrooms/${active._id}/leave`);
    } catch (e) {
      console.log(e);
    }
    setActive(null);
  };

  const createRoom = async () => {
    const name = prompt('Room name');
    if (!name) return;
    const { data } = await API.post('/studyrooms', { name });
    setRooms((r) => [data, ...r]);
  };

  const fmt = (ms) => {
    const s = Math.floor(ms/1000);
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    return `${h}h ${m}m ${sec}s`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-12 gap-4 bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="col-span-4 border rounded-lg">
        <div className="p-3 flex justify-between items-center border-b">
          <span className="font-semibold">Study Rooms</span>
          <button className="btn-outline" onClick={createRoom}>New</button>
        </div>
        <ul>
          {rooms.map((r) => (
            <li key={r._id} className={`p-3 cursor-pointer hover:bg-gray-50 ${active?._id===r._id?'bg-gray-100':''}`} onClick={()=>join(r)}>
              {r.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-8 border rounded-lg p-3">
        {!active ? 'Select a room' : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{active.name}</div>
              <button className="btn-outline" onClick={leave}>Leave Room</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b"><th>User</th><th>Total Active Time</th></tr>
              </thead>
              <tbody>
                {times.map((t) => (
                  <tr key={t.userId} className="border-b">
                    <td>{t.username || t.userId}</td>
                    <td>{fmt(t.totalMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyRoom;



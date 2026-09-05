import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const { notifications } = useSocket();
  const ref = useRef();

  const load = async () => {
    const { data } = await api.get('/notifications');
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  // Merge in live socket notifications as they arrive
  useEffect(() => {
    if (notifications.length) {
      setItems((prev) => [notifications[0], ...prev]);
    }
  }, [notifications]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card p-2 z-50">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">
              Mark all read
            </button>
          </div>
          {items.length === 0 && (
            <p className="text-sm text-gray-500 px-2 py-4 text-center">No notifications yet</p>
          )}
          {items.map((n, i) => (
            <div
              key={n._id || i}
              className={`px-2 py-2 rounded-lg text-sm ${!n.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
            >
              <p className="text-gray-800 dark:text-gray-100">{n.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'just now'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

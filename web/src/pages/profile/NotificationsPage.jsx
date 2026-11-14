import { useEffect, useState } from 'react';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

const TYPE_ICONS = { order: '📦', marketplace: '🏪', membership: '💎', system: '🔔' };

export default function NotificationsPage() {
  useDocumentTitle('Notifications');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/my')
      .then((r) => { if (r.data.success) setNotifications(r.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
  };

  const markOne = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        <button type="button" className="text-xs font-semibold text-accent" onClick={markAll}>Mark all read</button>
      </div>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && notifications.length === 0 && <EmptyState icon="🔔" title="No Notifications" subtitle="You're all caught up!" />}
      <div className="space-y-2">
        {notifications.map((n) => (
          <button key={n._id} type="button" onClick={() => markOne(n._id)} className={`flex w-full items-start rounded-lg bg-card p-4 text-left shadow-sm ${n.isRead ? '' : 'border-l-[3px] border-accent bg-[#fdf8f5]'}`}>
            <span className="mr-3 text-2xl">{TYPE_ICONS[n.type] || '🔔'}</span>
            <span className="flex-1">
              <span className={`block text-md ${n.isRead ? '' : 'font-bold'}`}>{n.title}</span>
              <span className="block text-sm text-muted">{n.message}</span>
              <span className="mt-1 block text-xs text-mutedLight">{new Date(n.createdAt).toLocaleDateString()}</span>
            </span>
            {!n.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-accent" />}
          </button>
        ))}
      </div>
    </div>
  );
}

import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

const ActivityFeed = ({ items }) => {
  if (!items?.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No recent activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((a) => (
        <div key={a._id} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <Activity size={14} className="text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              <span className="font-semibold text-gray-900 dark:text-white">{a.user?.name || 'Someone'}</span>{' '}
              {a.action}
            </p>
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;

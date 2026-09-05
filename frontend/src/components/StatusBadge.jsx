const styles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  skipped: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
};

const labels = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  skipped: 'Skipped'
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${styles[status] || styles.pending}`}>{labels[status] || status}</span>
);

export default StatusBadge;

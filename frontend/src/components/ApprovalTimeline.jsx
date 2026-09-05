import { CheckCircle2, XCircle, Clock, User2 } from 'lucide-react';

const iconFor = (status) => {
  if (status === 'approved') return <CheckCircle2 size={20} className="text-emerald-500" />;
  if (status === 'rejected') return <XCircle size={20} className="text-rose-500" />;
  return <Clock size={20} className="text-amber-500" />;
};

const ApprovalTimeline = ({ chain, currentLevel }) => {
  return (
    <ol className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3">
      {chain.map((step, idx) => (
        <li key={idx} className="mb-6 ml-6 last:mb-0">
          <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-900 rounded-full">
            {iconFor(step.status)}
          </span>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Level {step.level}: {step.approver?.name || 'Unknown approver'}
            </p>
            {step.level === currentLevel && step.status === 'pending' && (
              <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                Awaiting action
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <User2 size={12} /> {step.approver?.role}
          </p>
          {step.comment && (
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 inline-block">
              "{step.comment}"
            </p>
          )}
          {step.actedAt && (
            <p className="text-xs text-gray-400 mt-1">{new Date(step.actedAt).toLocaleString()}</p>
          )}
        </li>
      ))}
    </ol>
  );
};

export default ApprovalTimeline;

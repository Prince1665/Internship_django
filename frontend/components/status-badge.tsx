import { DocumentStatus, RequestStatus } from '@/lib/context';

type Status = DocumentStatus | RequestStatus;

interface StatusBadgeProps {
  status: Status;
}

const styles: Record<Status, { badge: string; dot: string }> = {
  Active: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  'Under Review': { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Revised: { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  Pending: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Approved: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Rejected: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  Processed: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = styles[status] ?? styles.Processed;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

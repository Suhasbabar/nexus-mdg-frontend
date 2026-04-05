interface StatusBadgeProps {
  status: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
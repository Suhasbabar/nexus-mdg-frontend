interface PriorityBadgeProps {
  priority: string
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-700' },
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
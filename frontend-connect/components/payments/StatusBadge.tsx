interface Props {
  status: 'succeeded' | 'refunded' | 'disputed'
}

export default function StatusBadge({ status }: Props) {
  const styles = {
    succeeded: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-800',
    disputed: 'bg-orange-100 text-orange-800',
  }

  const labels = {
    succeeded: 'Succeeded',
    refunded: 'Refunded',
    disputed: 'Disputed',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
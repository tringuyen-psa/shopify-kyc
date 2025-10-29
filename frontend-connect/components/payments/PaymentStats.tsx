import Chart from '@/components/ui/Chart'

interface Props {
  title: string
  amount: number
  change: number
  chartData?: number[]
}

export default function PaymentStats({ title, amount, change, chartData }: Props) {
  const defaultChartData = [60, 55, 50, 45, 40, 35, 38, 30, 28, 25, 20];
  const data = chartData || defaultChartData;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">
              ${(amount / 1000).toFixed(1)}k
            </h3>
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
              +{change}%
            </span>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-20">
        <Chart data={data} />
      </div>
    </div>
  )
}
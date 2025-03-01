import AreaChartComponent from '../components/AreaChart'
import BarChartComponent from '../components/BarChart'
import LineChartComponent from '../components/LineChart'

export const renderChart = ({ graphType, filteredData }: { graphType: string, filteredData: any }) => {
  switch (graphType) {
    case 'bar':
      return (
        <BarChartComponent filteredData={filteredData} />
      )
    case 'line':
      return (
        <LineChartComponent filteredData={filteredData} />
      )
    default:
      return (
        <AreaChartComponent filteredData={filteredData} />
      )
  }
}

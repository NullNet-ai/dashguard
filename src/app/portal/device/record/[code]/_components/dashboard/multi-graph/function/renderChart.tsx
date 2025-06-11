import AreaChartComponent from '../components/AreaChart'
import BarChartComponent from '../components/BarChart'
import LineChartComponent from '../components/LineChart'

export const renderChart = ({ graphType, filteredData, interfaces }: { graphType: string, filteredData: any, interfaces: any }) => {
  
  switch (graphType) {
    case 'bar':
      return (
        <BarChartComponent filteredData={filteredData} interfaces={interfaces}/>
      )
    case 'line':
      return (
        <LineChartComponent filteredData={filteredData} interfaces={interfaces}/>
      )
    default:
      return (
        <AreaChartComponent filteredData={filteredData} interfaces={interfaces}/>
      )
  }
}

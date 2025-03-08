'use client'
import React, {
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

import { generateFlowData } from './functions/generateFlowData'
import { mock_bandwidth } from './functions/mock_bandwidth'
import { type INetworkFlowContext, type Edge, type FlowElement } from './types'

import { api } from '~/trpc/react'

const NetworkFlowContext = React.createContext<INetworkFlowContext>({
})

interface IProps extends PropsWithChildren {
  test?: any

}

export default function NetworkFlowProvider({ children }: IProps) {
  const [elements, setElements] = useState<{ nodes: FlowElement[], edges: Edge[] }>({ nodes: [], edges: [] })

  // const { data: packetsIP, refetch } = api.packet.fetchPacketsIP.useQuery({})
  // const { data: bandwidth } = api.packet.getBandwidthOfSourceIP.useQuery(
  //   { packet_data: packetsIP }, { enabled: !!packetsIP }
  // )
  // console.log('%c Line:26 🍧 packetsIP', 'color:#b03734', packetsIP)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!packetsIP) {
  //       await refetch()
  //     }
  //   }
  //   fetchData().catch(error => console.error('Error fetching data:', error))
  // }, [packetsIP, refetch])

  // useEffect(() => {
  //   if (bandwidth) {
  //     setElements(generateFlowData(bandwidth))
  //   }
  // }, [bandwidth])
  const state = {
    elements,
  }
  const actions = {}

  return (
    <NetworkFlowContext.Provider
      value={{
        state,
        actions,
      }}
    >
      {children}
    </NetworkFlowContext.Provider>
  )
}

export const useFetchNetworkFlow = (): INetworkFlowContext => {
  const context = useContext(NetworkFlowContext)
  if (!context) {
    console.warn('use Fetch Network Flow must be used within a NetworkFlowProvider')
    throw new Error('use Fetch Network Flow must be used within a NetworkFlowProvider')
  }

  return context
}

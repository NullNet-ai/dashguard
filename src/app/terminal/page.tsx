
import dynamic from "next/dynamic";


const WebTerminal = dynamic(() => import('./client'), {
  ssr: false,
})

export default function TerminalPage() {
  return <WebTerminal />
}
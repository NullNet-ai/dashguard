
import dynamic from "next/dynamic";


const WebTerminal = dynamic(() => import('./client'), {
})

export default function TerminalPage() {
  return <WebTerminal />
}
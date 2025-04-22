'use client'
import { useEffect } from "react";
import { AttachAddon } from "@xterm/addon-attach";
import { useXTerm } from "react-xtermjs";

export default function WebTerminal() {
  const { instance, ref } = useXTerm();

  useEffect(() => {
    const url = `ws://3bb5737c771cb696973e59c3a515eafc.anton.home:4444/ws/`;
    // const url = `ws://192.168.2.52:1234/ws/`;

    const socket = new WebSocket(url);
    const addon = new AttachAddon(socket);
    instance?.loadAddon(addon);

    return () => {};
  }, [ref, instance]);

  return <div ref={ref} style={{ width: "100vw", height: "100vh" , marginTop: "3px", marginLeft: "3px"}} />;
}
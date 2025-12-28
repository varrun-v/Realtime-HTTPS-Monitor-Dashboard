"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setEvents((prev) => {
        const next = [data, ...prev];
        return next.slice(0, 50);
      });
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => ws.close();
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: "monospace" }}>
      <h2>Live HTTP Requests</h2>

      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <th>Time</th>
            <th>Method</th>
            <th>Path</th>
            <th>Status</th>
            <th>Latency (ms)</th>
          </tr>
        </thead>

        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td>{new Date(e.timestamp).toLocaleTimeString()}</td>
              <td>{e.method}</td>
              <td>{e.path}</td>
              <td>{e.status}</td>
              <td>{e.latency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

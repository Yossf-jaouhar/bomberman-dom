export function connectWebSocket(nickname) {
    const url = `ws://localhost:3000/?name=${encodeURIComponent(nickname)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log("WebSocket connected as:", nickname);
    };
    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
    ws.onmessage = (event) => {
        console.log("Received:", event.data);
    };
    ws.onclose = () => {
        console.log("WebSocket closed");
    };
    return ws;
}

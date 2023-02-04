import { WebSocketServer, WebSocket } from 'ws'
import { server } from './app.js'

interface WSC extends WebSocket {
    isAlive?: boolean
}

const wss = new WebSocketServer({ server })

// heartbit
const heartbit = setInterval(() => {
    wss.clients.forEach((ws: WSC) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30_000);

wss.on('connection', (ws: WSC, req) => {
    ws.isAlive = true
    console.log(`Client ${req.socket.remoteAddress} connected`)

    ws.on('close', () => {
        console.log(`Client ${req.socket?.remoteAddress} disconnected`)
    })
})

wss.on('close', () => {
    try { clearInterval(heartbit) } catch { }
});

export default wss
import wss from './socket.js'
import app from './app.js'
import { Router, Request } from 'express'

app.get('/health', (_, res) => res.status(200).send('ok'))
app.use('/ws', Router().post('/message', (req: Request<{}, {}, {message?: string}>, res) => {
    if (!req.body.message) return res.status(500).send('The parameter "message" is required')
    wss.clients.forEach(ws => ws.send(req.body.message as string))
    return res.status(204).send()    
}))
import messages from './cache/messages.js'
import { Router, Request } from 'express'
import wss from './socket.js'
import app from './app.js'

app.get('/health', (_, res) => res.status(200).send('ok'))
app.use('/ws', Router()
    .post('/messages', (req: Request<{}, {}, {message?: string}>, res) => {
        console.log(req.body);
        
        if (!req.body.message) return res.status(500).send('The parameter "message" is required')
        
        messages.add(req.body.message)
        wss.clients.forEach(ws => ws.send(req.body.message as string))
        
        return res.status(204).send()    
    })
    .get('/messages', (_, res) => res.json([...messages.values()]))
)
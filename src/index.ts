import messages from './cache/messages.js'
import { Router, Request } from 'express'
import wss from './socket.js'
import rgbHex from 'rgb-hex'
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
app.use('/fake', Router()
    .get('/discord/message', async (req: Request<{}, {}, {}, {username?: string; avatar?: string; bot?: string; verified?: string; message?: string; color?: string; }>, res) => {
        let {
            username = 'Oneki',
            avatar = 'https://cdn.discordapp.com/avatars/901956486064922624/e7d4737319365eed6d83bd29606e5872.png?size=80',
            bot,
            verified,
            message = 'Hey, who are you?',
            color = '#62a4c7'
        } = req.query
        message = message.replace(/</gi, '&#60;').replace(/>/gi, '&#62;')
    
        const users = message.match(/&#60;@!?\d{18,19}&#62;/gi)
        if (users)
            for (const m of users) {
                const user = await fetchUser(m.replace(/&#60;@!?/, '').replace('&#62;', ''))
                message = message.replace(m, `<span class="wrapper-1ZcZW-">@${user.username}</span>`)
            }
    
        const emojis = message.match(/&#60;a?:[a-z_]+:\d{18,19}&#62;/gi)
        if (emojis)
            for (const m of emojis)
                message = message.replace(
                    m,
                    `<span class="emojiContainer-2XKwXX" role="button" tabindex="0"><img aria-label=":${m.replace(
                        /&#60;a?:(?<name>[\w]+):(?<id>\d{18})&#62;/,
                        '$<name>'
                    )}:" src="https://cdn.discordapp.com/emojis/${m.replace(
                        /&#60;a?:(?<name>[\w]+):(?<id>\d{18})&#62;/,
                        '$<id>'
                    )}.webp?size=44&amp;quality=lossless" alt="${m.replace(
                        /&#60;a?:(?<name>[\w]+):(?<id>\d{18})&#62;/,
                        '$<name>'
                    )}" draggable="false" class="emoji" data-type="emoji" data-id="${m.replace(
                        /&#60;a?:(?<name>[\w]+):(?<id>\d{18})&#62;/,
                        '$<id>'
                    )}"></span>`
                )
    
        res.render('discordMessage', {
            layout: false,
            username,
            avatar,
            message,
            color: processColor(color),
            bot: Object.values(req.query).length > 0 ? isBotVerified(bot, verified) : isBotVerified(true, true)
        })
    })
)

function isBotVerified(bot?: any, verified?: any) {
    if (typeof bot === 'undefined') return ''
    if (typeof verified === 'undefined')
        return '<span class="botTagCozy-3NTBvK botTag-1NoD0B botTagRegular-kpctgU botTag-7aX5WZ rem-3kT9wc"><span class="botText-1fD6Qk">BOT</span></span>'
    return '<span class="botTagCozy-3NTBvK botTag-1NoD0B botTagRegular-kpctgU botTag-7aX5WZ rem-3kT9wc"><svg aria-label="Bot verificado" class="botTagVerified-2KCPMa" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2"><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="currentColor"></path></svg><span class="botText-1fD6Qk">BOT</span></span>'
}

/**
 *
 * @param {string} color
 */
function processColor(color: string) {
    if (/(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)/i) {
        if (color.startsWith('#')) return color.slice(1)
        else if (color.startsWith('0x')) return color.slice(2)
        else if (color.startsWith('rgb')) return rgbHex(color)
        else return '62a4c7"'
    } else return '62a4c7"'
}

/**
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function fetchUser(id: string) {
    console.log(id)
    const res = await fetch(`https://discord.com/api/v9/users/${id}`, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json'
        }
    })
    if (res.ok) return res.json()
    else return { message: 'User not found', username: 'Usuario desconocido' }
}
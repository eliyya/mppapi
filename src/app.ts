import {join, resolve} from 'path'
import express from 'express'
import cors from 'cors'

const app = express()

app.set('port', process.env.PORT || 3000)
app.set('views', join(resolve(process.cwd()), 'views'))
app.set('view engine', 'ejs')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(join(resolve(process.cwd()), 'public')))

const server = app.listen(app.get('port'), () => {
    console.log(`listen on http://localhost:${app.get('port')}`)
})

export default app
export { server, app }
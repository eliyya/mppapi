import express from 'express'

const app = express()

app.set('port', process.env.PORT || 3000)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const server = app.listen(app.get('port'), () => {
    console.log(`listen on http://localhost:${app.get('port')}`)
})

export default app
export { server, app }
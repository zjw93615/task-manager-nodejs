const express = require('express')
const cors = require('cors')
require('./db/mongoose')


const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')
const projectRouter = require('./routers/projectRouter')

const app = express()
const port = process.env.PORT || 3000

// Middleware
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disable')
//     }else {
//         next()
//     }
// })
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.use(projectRouter)



app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

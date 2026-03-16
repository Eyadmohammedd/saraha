import { NODE_ENV, appConfig } from '../config/config.service.js'
import { authRouter, userRouter } from './modules/index.js'
import { connectDB } from "./DB/connection.db.js";

import express from 'express'

async function bootstrap() {
    const app = express()

    // middleware
    app.use(express.json())

    // DB
    await connectDB()

    // routes
    app.get('/', (req, res) => res.send('Hello World!'))

    app.use('/auth', authRouter)
    app.use('/user', userRouter)

    // ❌ any route not found
   app.use((req, res) => {
    return res.status(404).json({ message: "Invalid application routing" })
})

    // error handling
    app.use((error, req, res, next) => {
        const status = error.cause?.status ?? 500

        return res.status(status).json({
            error_message:
                status === 500
                    ? 'something went wrong'
                    : error.message ?? 'something went wrong',
            stack: NODE_ENV === "development" ? error.stack : undefined
        })
    })

    app.listen(appConfig.port, () =>
        console.log(`🚀 Server running on port ${appConfig.port}`)
    )
}

export default bootstrap
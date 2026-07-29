import pino from 'pino'
import pinoHttp from 'pino-http'
import { config } from '../../config/env'
import { randomUUID } from 'crypto'

export const logger = pino({
  level: config.isDev ? 'debug' : 'info',
  transport: config.isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

export const httpLogger = pinoHttp({
  logger,
  genReqId: function (req, res) {
    const existingId = req.id ?? req.headers['x-request-id']
    if (existingId) return existingId
    const id = randomUUID()
    res.setHeader('X-Request-Id', id)
    return id
  },
})

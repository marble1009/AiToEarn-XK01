import { join } from 'node:path'
import { startApplication } from '@yikart/common'
import { AppModule } from './app.module'
import { config } from './config'

startApplication(AppModule, config, {
  setupApp: (app) => {
    app.enableCors({
      origin: [
        'https://xiaok.up.railway.app',
        'https://aitoearn-xk01-production.up.railway.app'
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization, x-request-id',
    })

    app.setViewEngine('ejs')
    app.setBaseViewsDir(join(__dirname, 'views'))
    app.useStaticAssets(join(__dirname, 'public'))
  },
})

import express, { Router } from 'express';
import { errorMiddleware } from './middlewares/error-middleware.js';
import dotenv from 'dotenv';
dotenv.config();

class App {
  app;

  constructor(controllers) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.addErrorMiddleware();
  }

  listen() {
    const port =
      process.env.NODE_ENV === 'production' ? process.env.PORT : 8081;
    const server = this.app.listen(port, () => {});
    server.keepAliveTimeout = 60000;
  }

  initializeMiddlewares() {
    this.app.use(express.json());
  }

  addErrorMiddleware() {
    this.app.use(errorMiddleware);
  }

  initializeControllers(controllers) {
    const router = Router();
    router.get('/', (req, res) => res.send('pong'));

    controllers.forEach((controller) => {
      router.use(controller.router);
    });

    this.app.use('/api', router);
  }
}

export default App;

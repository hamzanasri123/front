import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import Routes from './interfaces/routes.interface';
import errorMiddleware from './middlewares/error.middleware';
import mongoose from 'mongoose';

class App {
  public app: express.Application;
  public port: string | number;
  public env: boolean;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV === 'production' ? true : false;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();

    //Serve static files 
    this.app.use(express.static('uploads'));
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`🚀 App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    const { MONGO_HOST, MONGO_PORT, MONGO_DATABASE, MONGO_USERNAME, MONGO_PWD } = process.env;
    const options = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true };
    let connectionstring = `mongodb://${MONGO_USERNAME}:${MONGO_PWD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin&readPreference=primary&ssl=false`;
    if (!this.env) {
      connectionstring = `mongodb://localhost:27017/${MONGO_DATABASE}?authSource=admin&readPreference=primary&ssl=false`;
    }
    mongoose.connect(connectionstring, { ...options }).catch(error => {
      console.error('[ERROR]', error);
    });
  }

  private initializeMiddlewares() {
    if (this.env) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(logger('combined'));
      this.app.use(cors());
    } else {
      this.app.use(logger('dev'));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;

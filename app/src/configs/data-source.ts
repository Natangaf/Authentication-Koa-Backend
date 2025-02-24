import { DataSource  } from 'typeorm';
import { User } from '../entities/User';
import 'dotenv/config'; // <-- Adicione esta linha



export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'app_db',
  synchronize: true,
  logging: false,
  entities: [User],
});

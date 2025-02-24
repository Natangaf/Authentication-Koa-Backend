import Router from 'koa-router';
import { koaSwagger } from 'koa2-swagger-ui'; // Usar o pacote correto para Koa
import YAML from 'yamljs';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware, crateAdminMiddleware } from '../middlewares/adminMiddleware';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, '.', 'configs', 'swagger.yaml'));

const router = new Router();

// Configuração do Swagger UI para Koa
router.get(
  '/docs',
  koaSwagger({
    routePrefix: false, 
    swaggerOptions: {
      spec: swaggerDocument, 
    },
  }),
);


// Rota pública para autenticação
router.post('/auth',crateAdminMiddleware, UserController.authUser);

// Rota privada para obter os dados do usuário autenticado
router.get('/me', authMiddleware, UserController.listUser);

// Rota privada para editar dados do usuário
router.put('/edit-account/:id', authMiddleware, UserController.updateUser);

// Rota privada para listar todos os usuários
router.get('/users', authMiddleware, adminMiddleware, UserController.getAllUsers);




export default router;

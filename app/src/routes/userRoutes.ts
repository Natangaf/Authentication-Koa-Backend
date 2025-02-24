import Router from 'koa-router';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware, crateAdminMiddleware } from '../middlewares/adminMiddleware';

const router = new Router();


// Rota pública para autenticação
router.post('/auth',crateAdminMiddleware, UserController.authUser);

// Rota privada para obter os dados do usuário autenticado
router.get('/me', authMiddleware, UserController.listUser);

// Rota privada para editar dados do usuário
router.put('/edit-account/:id', authMiddleware, UserController.updateUser);

// Rota privada para listar todos os usuários
router.get('/users', authMiddleware, adminMiddleware, UserController.getAllUsers);




export default router;

import './user-management.swagger'
import { Router } from 'express'
import { requireAuth, requireAdmin, requireSuperAdmin } from '../../middleware/auth.middleware'
import { userManagementController } from './controllers/user-management.controller'

const router = Router()

router.get('/admin/learners', requireAuth, requireAdmin, userManagementController.getLearners.bind(userManagementController))
router.get('/admin/learners/:userId', requireAuth, requireAdmin, userManagementController.getLearnerById.bind(userManagementController))

router.get('/admin/facilitators', requireAuth, requireAdmin, userManagementController.getFacilitators.bind(userManagementController))
router.post('/admin/facilitators', requireAuth, requireAdmin, userManagementController.createFacilitator.bind(userManagementController))
router.put('/admin/facilitators/:id', requireAuth, requireAdmin, userManagementController.updateFacilitator.bind(userManagementController))
router.delete('/admin/facilitators/:id', requireAuth, requireAdmin, userManagementController.deleteFacilitator.bind(userManagementController))

router.get('/admin/facilitators/me', requireAuth, requireAdmin, userManagementController.getFacilitatorMe.bind(userManagementController))
router.patch('/admin/facilitators/me', requireAuth, requireAdmin, userManagementController.updateFacilitatorMe.bind(userManagementController))

router.get('/admin/admin-users', requireAuth, requireAdmin, userManagementController.getAdminUsers.bind(userManagementController))

router.get('/superadmin/users', requireAuth, requireSuperAdmin, userManagementController.getUsers.bind(userManagementController))
router.patch('/superadmin/users/:userId/role', requireAuth, requireSuperAdmin, userManagementController.updateUserRole.bind(userManagementController))
router.delete('/superadmin/users/:userId', requireAuth, requireSuperAdmin, userManagementController.deleteUser.bind(userManagementController))

router.get('/superadmin/learners', requireAuth, requireSuperAdmin, userManagementController.getLearners.bind(userManagementController))
router.get('/superadmin/learners/:userId', requireAuth, requireSuperAdmin, userManagementController.getLearnerById.bind(userManagementController))

export const userManagementRoutes = router

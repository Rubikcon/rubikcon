import './user-management.swagger'
import { Router, Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../../shared/api/response'
import { requireAuth, requireAdmin, requireSuperAdmin, requireFacilitator } from '../../middleware/auth.middleware'
import { userManagementController } from './controllers/user-management.controller'

const router = Router()

router.get('/admin/learners', requireAuth, requireAdmin, userManagementController.getLearners.bind(userManagementController))
router.get('/admin/learners/:userId', requireAuth, requireAdmin, userManagementController.getLearnerById.bind(userManagementController))

router.get('/admin/facilitators', requireAuth, requireAdmin, userManagementController.getActiveFacilitators.bind(userManagementController))

router.get('/admin/facilitators/me', requireAuth, requireAdmin, userManagementController.getFacilitatorMe.bind(userManagementController))
router.patch('/admin/facilitators/me', requireAuth, requireAdmin, userManagementController.updateFacilitatorMe.bind(userManagementController))

router.get('/facilitator/me', requireAuth, requireFacilitator, userManagementController.getFacilitatorMe.bind(userManagementController))
router.patch('/facilitator/me', requireAuth, requireFacilitator, userManagementController.updateFacilitatorMe.bind(userManagementController))

router.get('/admin/admin-users', requireAuth, requireAdmin, userManagementController.getAdminUsers.bind(userManagementController))

router.get('/superadmin/users', requireAuth, requireSuperAdmin, userManagementController.getUsers.bind(userManagementController))
router.get('/superadmin/overview', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platformRepository } = await import('../platform/repositories/platform.repository')
    const overview = await platformRepository.getSuperAdminOverview()
    return sendSuccess(res, overview)
  } catch (err) { next(err) }
})
router.patch('/superadmin/users/:userId/role', requireAuth, requireSuperAdmin, userManagementController.updateUserRole.bind(userManagementController))
router.delete('/superadmin/users/:userId', requireAuth, requireSuperAdmin, userManagementController.deleteUser.bind(userManagementController))

router.get('/superadmin/learners', requireAuth, requireSuperAdmin, userManagementController.getLearners.bind(userManagementController))
router.get('/superadmin/learners/:userId', requireAuth, requireSuperAdmin, userManagementController.getLearnerById.bind(userManagementController))

router.post('/facilitator-applications', userManagementController.submitFacilitatorApplication.bind(userManagementController))
router.get('/superadmin/facilitator-applications', requireAuth, requireSuperAdmin, userManagementController.getFacilitatorApplications.bind(userManagementController))
router.patch('/superadmin/facilitator-applications/:id/status', requireAuth, requireSuperAdmin, userManagementController.updateFacilitatorApplicationStatus.bind(userManagementController))

router.get('/superadmin/facilitators', requireAuth, requireSuperAdmin, userManagementController.getFacilitators.bind(userManagementController))
router.patch('/superadmin/facilitators/:id', requireAuth, requireSuperAdmin, userManagementController.updateFacilitator.bind(userManagementController))

export const userManagementRoutes = router

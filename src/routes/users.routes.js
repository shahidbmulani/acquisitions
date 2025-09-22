import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import { authenticate, authorize } from '#middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

// Get all users - requires authentication, admin only
router.get('/', authenticate, authorize(['admin']), fetchAllUsers);

// Get user by ID - requires authentication
router.get('/:id', authenticate, getUserById);

// Update user - requires authentication
router.put('/:id', authenticate, updateUser);

// Delete user - requires authentication, admin only
router.delete('/:id', authenticate, authorize(['admin']), deleteUser);

export default router;

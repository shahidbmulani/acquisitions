import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users....');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    // Validate the request parameters
    const paramValidation = userIdSchema.safeParse({ id: req.params.id });

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserByIdService(id);

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Validate the request parameters
    const paramValidation = userIdSchema.safeParse({ id: req.params.id });

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramValidation.error),
      });
    }

    // Validate the request body
    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // Authorization checks
    const isOwner = req.user.id === id;
    const isAdmin = req.user.role === 'admin';

    // Users can only update their own information
    if (!isOwner && !isAdmin) {
      logger.warn(
        `User ${req.user.email} attempted to update user ${id} without permission`
      );
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'You can only update your own profile',
      });
    }

    // Only admins can change roles
    if (updates.role && !isAdmin) {
      logger.warn(
        `User ${req.user.email} attempted to change role without admin permissions`
      );
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user ${id}`);

    const updatedUser = await updateUserService(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Validate the request parameters
    const paramValidation = userIdSchema.safeParse({ id: req.params.id });

    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    // Authorization checks - only admins can delete users, and users cannot delete themselves
    const isAdmin = req.user.role === 'admin';
    const isSelfDelete = req.user.id === id;

    if (!isAdmin) {
      logger.warn(
        `User ${req.user.email} attempted to delete user ${id} without admin permissions`
      );
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'Only admins can delete users',
      });
    }

    if (isSelfDelete) {
      logger.warn(
        `Admin ${req.user.email} attempted to delete their own account`
      );
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'You cannot delete your own account',
      });
    }

    logger.info(`Deleting user ${id}`);

    const result = await deleteUserService(id);

    res.json({
      message: result.message,
      deletedUserId: result.id,
    });
  } catch (e) {
    logger.error('Error deleting user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

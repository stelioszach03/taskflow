const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/assign')
  .post(protect, assignTask);

router.route('/:id/unassign')
  .post(protect, unassignTask);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

module.exports = router;
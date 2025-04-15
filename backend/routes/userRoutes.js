const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/search')
  .get(protect, searchUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
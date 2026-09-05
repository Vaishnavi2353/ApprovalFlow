const User = require('../models/User');

// @route GET /api/users            -> list users (for picking approvers, admin/approver only)
const listUsers = async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter).select('-password').sort('name');
  res.json(users);
};

// @route PUT /api/users/profile    -> update own profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, department, designation } = req.body;
    if (name) user.name = name;
    if (department) user.department = department;
    if (designation) user.designation = designation;

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listUsers, updateProfile };

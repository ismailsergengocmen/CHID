/*
 * @desc    Logout the currently authenticated user
 * @route   GET /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
	req.session = null;
	res.end();
};

/*
 * @desc    Fetch the currently authenticated user
 * @route   GET /api/auth/user
 * @access  Private
 */
const getCurrentUser = (req, res) => {
	res.json(req.user);
};

export { logout, getCurrentUser };

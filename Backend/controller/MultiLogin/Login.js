import Admin from '../../model/UserModel/Admin.js';
import Super from '../../model/UserModel/Super.js';
import Staff from '../../model/admin/staff/Details.js';
import bcryptjs from 'bcryptjs';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    try {
        let userValid = await Admin.findOne({ email });
        let role = 'admin';

        if (!userValid) {
            userValid = await Super.findOne({ email });
            role = 'super';
        }

        if (!userValid) {
            userValid = await Staff.findOne({ email });
            role = 'staff';
        }

        if (userValid) {
            const isMatch = await bcryptjs.compare(password, userValid.password);
            if (!isMatch) {
                return res.status(401).json({ 
                    status: 401,
                    message: 'Incorrect password. Please try again.'
                });
            }

            // Admin-specific inactive check
            if (role === 'admin' && userValid.status === 'Inactive') {
                return res.status(403).json({
                    status: 403,
                    message: 'Admin account is inactive. Please contact your administrator.',
                    isInactive: true
                });
            }

            // Staff-specific check
            if (role === 'staff') {
                if (userValid.status === 'Inactive') {
                    return res.status(403).json({
                        status: 403,
                        message: 'Staff account is inactive. Please contact your administrator.',
                        isInactive: true
                    });
                }

                // Find the Admin for this restaurant
                const admin = await Admin.findOne({ _id: userValid.AdminId });

                if (!admin || admin.status === 'Inactive') {
                    return res.status(403).json({
                        status: 403,
                        message: 'Staff access denied because the associated Admin is inactive.',
                        isInactive: true
                    });
                }
            }

            const token = await userValid.generateAuthToken();

            res.cookie("userCookie", token, {
                expires: new Date(Date.now() + 9000000),
                httpOnly: true
            });

            res.status(201).json({
                status: 201,
                result: { userValid, token, role },
                message: "Login successful"
            });
        } else {
            return res.status(404).json({ 
                status: 404,
                message: 'User not found. Please check your email address.' 
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 500,
            message: 'Internal server error. Please try again later.' 
        });
    }
};

export const validUser = async (req, res) => {
    try {
        let validUser;
        let isInactive = false;
        let userRole = '';

        // Check if the user exists in the Admin model
        if (await Admin.findOne({ _id: req.userId })) {
            validUser = await Admin.findOne({ _id: req.userId });
            userRole = 'admin';
            if (validUser.status === 'Inactive') {
                isInactive = true;
            }
        } else if (await Super.findOne({ _id: req.userId })) {
            // If not found in Admin, check in Super model
            validUser = await Super.findOne({ _id: req.userId });
            userRole = 'super';
        } else if (await Staff.findOne({ _id: req.userId })) {
            // If not found in Super, check in Staff model
            validUser = await Staff.findOne({ _id: req.userId });
            userRole = 'staff';
            if (validUser.status === 'Inactive') {
                isInactive = true;
            }
            
            // Additionally check if the associated Admin is inactive
            if (!isInactive) {
                const admin = await Admin.findOne({ _id: validUser.AdminId });
                if (admin && admin.status === 'Inactive') {
                    isInactive = true;
                }
            }
        } else {
            // If user is not found in any model
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // If user is found, send a successful response with inactive status
        res.status(200).json({ status: 200, validUser, isInactive, userRole });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Server error", error });
    }
};

export const logOut = async (req, res) => {
    try {
        res.clearCookie("userCookie", { path: "/" });
        res.status(201).json({ status: 201, message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Logout failed" });
    }
};

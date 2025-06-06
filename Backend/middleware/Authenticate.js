import jwt from 'jsonwebtoken';
import Admin from "../model/UserModel/Admin.js";
import Super from '../model/UserModel/Super.js';
import Customer from "../model/customer/Customer.js";
import Staff from "../model/admin/staff/Details.js";
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ status: 401, message: "Unauthorized, no token provided" });
        }

        // Verify the token
        const verifytoken = jwt.verify(token, keySecret);

        // Try to find the user in any model
        const rootUser = await Admin.findById(verifytoken._id) ||
                         await Super.findById(verifytoken._id) ||
                         await Customer.findById(verifytoken._id) ||
                         await Staff.findById(verifytoken._id);

        if (!rootUser) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();
    } catch (error) {
        res.status(401).json({ status: 401, message: "Unauthorized, invalid token" });
    }
};

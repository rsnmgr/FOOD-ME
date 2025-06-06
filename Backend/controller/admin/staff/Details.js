import fs from 'fs';
import path from 'path';
import Details from '../../../model/admin/staff/Details.js';
import Super from '../../../model/UserModel/Super.js';
import Admin from '../../../model/UserModel/Admin.js';

// Helper function to delete a file safely
const deleteImageFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting image:", err);
            }
        });
    }
};
const isEmailDuplicate = async (email) => {
    const emailRegex = new RegExp(`^${email}$`, 'i'); // Case-insensitive match
    const existingCustomer = await Admin.findOne({ email: emailRegex });
    const existingSuper = await Super.findOne({ email: emailRegex });
    const existingStaff = await Details.findOne({ email: emailRegex });
    return existingCustomer || existingSuper || existingStaff;
};
// Add a new staff detail
export const addDetail = async (req, res) => {
    try {
        const { AdminId, name, email, category, address, phone, salary, status, password } = req.body;
        const image = req.file ? req.file.path : null;
        // Check if the email already exists in any user collection
        if (await isEmailDuplicate(email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        let detailEntry = new Details({
            AdminId,
            name,
            email,
            category,
            address,
            phone,
            salary,
            status,
            image,
            password
        });

        await detailEntry.save();
        res.status(201).json({ message: 'Staff detail added successfully', detailEntry });

    } catch (error) {
        console.error('Error adding staff detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all details for a specific AdminId
export const getDetails = async (req, res) => {
    try {
        const { AdminId } = req.params;
        const details = await Details.find({ AdminId });

        if (!details.length) {
            return res.status(404).json({ message: 'No staff details found for this AdminId' });
        }

        res.status(200).json({ details });
    } catch (error) {
        console.error('Error fetching staff details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch a specific staff detail by ID
export const getDetailById = async (req, res) => {
    try {
        const { AdminId, detailId } = req.params;
        const detail = await Details.findOne({ _id: detailId, AdminId });

        if (!detail) {
            return res.status(404).json({ message: 'Staff detail not found' });
        }

        res.status(200).json({ detail });
    } catch (error) {
        console.error('Error fetching staff detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific staff detail
export const updateDetail = async (req, res) => {
    try {
        
        const { AdminId, detailId } = req.params;
        const { name, email, category, address, phone, salary, status, password } = req.body;
        const newImage = req.file ? req.file.path : null;

        const detail = await Details.findOne({ _id: detailId, AdminId });

        if (!detail) {
            return res.status(404).json({ message: 'Staff detail not found' });
        }
            if (email && email !== detail.email) {
            if (await isEmailDuplicate(email, detailId)) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        // Delete the old image if a new one is uploaded
        if (newImage && detail.image) {
            deleteImageFile(detail.image);
        }

        // Update fields
        detail.name = name || detail.name;
        detail.email = email || detail.email;
        detail.category = category || detail.category;
        detail.address = address || detail.address;
        detail.phone = phone || detail.phone;
        detail.salary = salary || detail.salary;
        detail.status = status || detail.status;
        detail.image = newImage || detail.image;
        if (password) detail.password = password; // Hashing handled in schema

        await detail.save();

        res.status(200).json({ message: 'Staff detail updated successfully', detail });
    } catch (error) {
        console.error('Error updating staff detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a specific staff detail
export const deleteDetail = async (req, res) => {
    try {
        const { AdminId, detailId } = req.params;

        const detail = await Details.findOneAndDelete({ _id: detailId, AdminId });

        if (!detail) {
            return res.status(404).json({ message: 'Staff detail not found' });
        }

        // Delete the associated image file
        if (detail.image) {
            deleteImageFile(detail.image);
        }

        res.status(200).json({ message: 'Staff detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

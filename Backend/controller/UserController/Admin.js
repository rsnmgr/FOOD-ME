import Customer from '../../model/UserModel/Admin.js';
import Super from '../../model/UserModel/Super.js';
import Staff from '../../model/admin/staff/Details.js';
import fs from 'fs';
import bcryptjs from 'bcryptjs'; // Only used for comparing the old password

import { io } from '../../server.js';

// Helper function to delete an image file
const deleteImageFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting image:', err);
        }
    });
};

// Case-insensitive email check in Customer, Super, and Staff collections
const isEmailDuplicate = async (email) => {
    const emailRegex = new RegExp(`^${email}$`, 'i'); // Case-insensitive match
    const existingCustomer = await Customer.findOne({ email: emailRegex });
    const existingSuper = await Super.findOne({ email: emailRegex });
    const existingStaff = await Staff.findOne({ email: emailRegex });
    return existingCustomer || existingSuper || existingStaff;
};

// Create a customer
export const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, restaurant, password, status } = req.body;


        // Check if the email already exists in any user collection
        if (await isEmailDuplicate(email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const data = { name, email, phone, address, restaurant, password, status };

        // Include image path if an image was uploaded
        if (req.file) {
            data.image = req.file.path;
        }

        // Create and save new customer
        const newCustomer = new Customer(data);
        await newCustomer.save();

        return res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
};

// Fetch all customers excluding sensitive information
export const fetchCustomers = async (req, res) => {
    try {
        // Retrieve all customers from the database
        const customers = await Customer.find().select('-password'); // Exclude password from results

        // Check if customers exist
        if (!customers.length) {
            return res.status(404).json({ message: 'No customers found' });
        }

        // Return the list of customers
        return res.status(200).json({ message: 'Customers retrieved successfully', customers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

// Fetch customer by ID
export const fetchCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findById(id).select('-password');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        return res.status(200).json({ message: 'Customer retrieved successfully', customer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
};

// Update customer details and image
export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, restaurant, password,status,trialEndDate,trialStartDate } = req.body;
    const image = req.file ? req.file.path : null;

    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Check if the updated email already exists in another record
        if (email && email !== customer.email && await isEmailDuplicate(email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // If a new image is uploaded, delete the old one
        if (image && customer.image) {
            deleteImageFile(customer.image);
        }

        // Update customer details
        customer.name = name || customer.name;
        customer.email = email || customer.email;
        customer.phone = phone || customer.phone;
        customer.address = address || customer.address;
        customer.restaurant = restaurant || customer.restaurant;
        customer.password = password || customer.password;
        customer.status = status || customer.status;
        customer.trialEndDate = trialEndDate || customer.trialEndDate;
        customer.trialStartDate = trialStartDate || customer.trialStartDate;
        // Update image if a new one is provided
        if (image) {
            customer.image = image;
        }

        await customer.save();
        io.emit('userUpdated', Customer);
        return res.status(200).json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};

// Delete customer and associated image
export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Delete the customer's image file if it exists
        if (customer.image) {
            deleteImageFile(customer.image);
        }

        return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
};

// Update only the customer image
export const updateCustomerImage = async (req, res) => {
    const userId = req.body.userId; // Access userId from req.body
    const newImage = req.file ? req.file.path : null; // Get the uploaded image path

    try {
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // If a new image is uploaded, delete the old one
        if (newImage && customer.image) {
            deleteImageFile(customer.image);
        }

        // Update the customer's image
        if (newImage) {
            customer.image = newImage;
        }

        await customer.save();
        io.emit('userUpdated', customer);
        return res.status(200).json({ message: 'Customer image updated successfully', customer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating customer image', error: error.message });
    }
};

// Delete customer's image
export const deleteCustomerImage = async (req, res) => {
    const userId = req.params.userId; // Access userId from req.params

    try {
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Delete the customer's image file if it exists
        if (customer.image) {
            deleteImageFile(customer.image); // Your function to delete the image file
            customer.image = null; // Clear the image reference in the database
            await customer.save();
            io.emit('userDeleted', customer);

        }

        return res.status(200).json({ message: 'Customer image deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting customer image', error: error.message });
    }
};

// Update password for customer
export const updateCustomerPassword = async (req, res) => {
    const { userId } = req.params; // Access userId from req.params
    const { oldPassword, newPassword, confirmPassword } = req.body; // Password data from request body


    try {
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Validate old password by comparing with hashed password in the database
        const isMatch = await bcryptjs.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Store the new password in plaintext (not recommended)
        customer.password = newPassword; // Directly setting new password without hashing

        await customer.save();
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

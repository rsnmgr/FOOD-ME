import fs from 'fs';
import path from 'path';
import Purchases from '../../../model/admin/report/purchase.js'; // Adjust path
import { io } from "../../../server.js";

// Helper function to delete an image file
const deleteImageFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting image:", err);
        }
    });
};

// Add a new purchase
export const addPurchase = async (req, res) => {
    try {
        const { AdminId, supplierName, dateOfPurchase, itemName, quantity, pricePerUnit, paymentStatus } = req.body;
        const image = req.file ? req.file.path : null;
        const totalPrice = quantity * pricePerUnit;
        
        let purchaseEntry = await Purchases.findOne({ AdminId });

        if (purchaseEntry) {
            purchaseEntry.purchases.push({ supplierName, dateOfPurchase, itemName, quantity, pricePerUnit, totalPrice, paymentStatus, image });
        } else {
            purchaseEntry = new Purchases({
                AdminId,
                purchases: [{ supplierName, dateOfPurchase, itemName, quantity, pricePerUnit, totalPrice, paymentStatus, image }]
            });
        }

        await purchaseEntry.save();
        io.emit("purchaseAdded", purchaseEntry);

        res.status(200).json({ message: 'Purchase added successfully', purchaseEntry });
    } catch (error) {
        console.error('Error adding purchase:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all purchases for a specific AdminId
export const getPurchases = async (req, res) => {
    try {
        const { AdminId } = req.params;
        
        // Check if AdminId is undefined or not valid
        if (!AdminId || AdminId === 'undefined') {
            return res.status(400).json({ message: 'Invalid AdminId provided' });
        }

        const purchaseEntry = await Purchases.findOne({ AdminId });

        if (!purchaseEntry) {
            return res.status(404).json({ message: 'No purchases found for this AdminId' });
        }

        res.status(200).json({ purchases: purchaseEntry.purchases });
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch a specific purchase by its ID
export const getPurchaseById = async (req, res) => {
    try {
        const { AdminId, purchaseId } = req.params;

        const purchaseEntry = await Purchases.findOne({ AdminId });

        if (!purchaseEntry) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        const purchase = purchaseEntry.purchases.id(purchaseId);

        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        res.status(200).json({ purchase });
    } catch (error) {
        console.error('Error fetching purchase:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific purchase
export const updatePurchase = async (req, res) => {
    try {
        const { AdminId, purchaseId } = req.params;
        const { supplierName, dateOfPurchase, itemName, quantity, pricePerUnit, paymentStatus } = req.body;
        const newImage = req.file ? req.file.path : null;

        const purchaseEntry = await Purchases.findOne({ AdminId });

        if (!purchaseEntry) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        const purchase = purchaseEntry.purchases.id(purchaseId);

        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        // If there is a new image, delete the old one
        if (newImage && purchase.image) {
            deleteImageFile(purchase.image);
        }

        // Update the purchase fields
        purchase.supplierName = supplierName || purchase.supplierName;
        purchase.dateOfPurchase = dateOfPurchase || purchase.dateOfPurchase;
        purchase.itemName = itemName || purchase.itemName;
        purchase.quantity = quantity || purchase.quantity;
        purchase.pricePerUnit = pricePerUnit || purchase.pricePerUnit;
        purchase.paymentStatus = paymentStatus || purchase.paymentStatus;
        purchase.totalPrice = quantity * pricePerUnit || purchase.totalPrice;
        purchase.image = newImage || purchase.image;

        await purchaseEntry.save();
        io.emit("purchaseUpdated", purchaseEntry);

        res.status(200).json({ message: 'Purchase updated successfully', purchase });
    } catch (error) {
        console.error('Error updating purchase:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a specific purchase
export const deletePurchase = async (req, res) => {
    try {
        const { AdminId, purchaseId } = req.params;

        const purchaseEntry = await Purchases.findOne({ AdminId });

        if (!purchaseEntry) {
            return res.status(404).json({ message: 'Purchase entry not found' });
        }

        const result = await Purchases.updateOne(
            { AdminId, 'purchases._id': purchaseId },
            { $pull: { purchases: { _id: purchaseId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        const removedPurchase = purchaseEntry.purchases.id(purchaseId);
        
        if (removedPurchase && removedPurchase.image) {
            deleteImageFile(removedPurchase.image);
        }

        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        console.error('Error deleting purchase:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

import Category from '../../../model/admin/menu/Category.js'; // Adjust the import path accordingly
import { io } from '../../../server.js';
import Products from "../../../model/Admin/Menu/Products.js"; // Adjust the import path accordingly

// Helper function to fetch category by AdminId
const findCategoryByAdminId = async (AdminId) => {
    return await Category.findOne({ AdminId });
};

// Add a new category
export const addCategory = async (req, res) => {
    try {
        const { AdminId, name, status } = req.body;

        // Find category document by AdminId
        let categoryEntry = await findCategoryByAdminId(AdminId);

        if (categoryEntry) {
            // Check if category name already exists (case-insensitive)
            const exists = categoryEntry.category.some(
                (cat) => cat.name.toLowerCase() === name.toLowerCase()
            );

            if (exists) {
                return res.status(400).json({ message: 'Category already exists' });
            }

            // Add new category
            categoryEntry.category.push({ name, status });
        } else {
            // Create new document if AdminId doesn't have one yet
            categoryEntry = new Category({
                AdminId,
                category: [{ name, status }]
            });
        }

        await categoryEntry.save();

        // Emit socket event
        io.emit('categoryAdded', categoryEntry);

        res.status(201).json({ message: 'Category added successfully', categoryEntry });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Fetch all categories for a specific AdminId
export const getCategories = async (req, res) => {
    try {
        const { AdminId } = req.params;
        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'No categories found for this AdminId' });
        }

        res.status(200).json({ categories: categoryEntry.category });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch a specific category by its ID
export const getCategoryById = async (req, res) => {
    try {
        const { AdminId, categoryId } = req.params;
        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'Category entry not found' });
        }

        const category = categoryEntry.category.id(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific category
export const updateCategory = async (req, res) => {
    try {
        const { AdminId, categoryId } = req.params;
        const { name, status } = req.body;

        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'Category entry not found' });
        }

        // Check if the new name already exists in a different category
        const duplicate = categoryEntry.category.find(
            (cat) => cat.name.toLowerCase() === name.toLowerCase() && cat._id.toString() !== categoryId
        );

        if (duplicate) {
            return res.status(400).json({ message: 'Category name already exists' });
        }

        const category = categoryEntry.category.id(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = name || category.name;
        category.status = status || category.status;

        await categoryEntry.save();
        io.emit('categoryUpdated', categoryEntry);

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete a specific category

export const deleteCategory = async (req, res) => {
  try {
    const { AdminId, categoryId } = req.params;

    const categoryEntry = await findCategoryByAdminId(AdminId);
    if (!categoryEntry) {
      return res.status(404).json({ message: 'Category entry not found' });
    }

    const categoryIndex = categoryEntry.category.findIndex(
      (cat) => cat._id.toString() === categoryId
    );
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if any product's category matches this categoryId
    const productEntry = await Products.findOne({ AdminId });
    if (productEntry) {
      const isCategoryUsed = productEntry.products.some(
        (product) => product.category === categoryId
      );
      if (isCategoryUsed) {
        return res.status(400).json({
          message:
            'Category is assigned to product(s) and cannot be deleted',
        });
      }
    }

    // Safe to delete category
    categoryEntry.category.splice(categoryIndex, 1);
    await categoryEntry.save();

    io.emit('categoryDeleted', categoryEntry);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
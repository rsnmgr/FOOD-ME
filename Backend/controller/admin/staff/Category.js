// import Category from '../../../model/admin/staff/Caterory.js';
// // Add a new category
// export const addStaffCategory = async (req, res) => {
//     try {
//       const { AdminId, name } = req.body;
  
//       let categoryEntry = await Category.findOne({ AdminId });
  
//       if (categoryEntry) {
//         const alreadyExists = categoryEntry.category.some(cat => cat.name.toLowerCase() === name.toLowerCase());
//         if (alreadyExists) {
//           return res.status(400).json({ message: 'Category with this name already exists' });
//         }
//         categoryEntry.category.push({ name });
//       } else {
//         categoryEntry = new Category({
//           AdminId,
//           category: [{ name }]
//         });
//       }
  
//       await categoryEntry.save();
  
//       res.status(201).json({ message: 'Category added successfully', categoryEntry });
//     } catch (error) {
//       console.error('Error adding category:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   };
  

// // Fetch all categories for a specific AdminId
// export const getStaffCategories = async (req, res) => {
//     try {
//         const { AdminId } = req.params;

//         const categoryEntry = await Category.findOne({ AdminId });

//         if (!categoryEntry) {
//             return res.status(404).json({ message: 'No categories found for this AdminId' });
//         }

//         res.status(200).json({ categories: categoryEntry.category });
//     } catch (error) {
//         console.error('Error fetching categories:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Fetch a specific category by its ID
// export const getStaffCategoryById = async (req, res) => {
//     try {
//         const { AdminId, categoryId } = req.params;

//         const categoryEntry = await Category.findOne({ AdminId });

//         if (!categoryEntry) {
//             return res.status(404).json({ message: 'Category not found' });
//         }

//         const category = categoryEntry.category.id(categoryId);

//         if (!category) {
//             return res.status(404).json({ message: 'Category not found' });
//         }

//         res.status(200).json({ category });
//     } catch (error) {
//         console.error('Error fetching category:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Update a specific category
// export const updateStaffCategory = async (req, res) => {
//     try {
//         const { AdminId, categoryId } = req.params;
//         const { name } = req.body;

//         const categoryEntry = await Category.findOne({ AdminId });

//         if (!categoryEntry) {
//             return res.status(404).json({ message: 'Category not found' });
//         }

//         const category = categoryEntry.category.id(categoryId);

//         if (!category) {
//             return res.status(404).json({ message: 'Category not found' });
//         }

//         category.name = name || category.name;

//         await categoryEntry.save();

//         res.status(200).json({ message: 'Category updated successfully', category });
//     } catch (error) {
//         console.error('Error updating category:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Delete a specific category
// export const deleteStaffCategory = async (req, res) => {
//     try {
//         const { AdminId, categoryId } = req.params;

//         const categoryEntry = await Category.findOne({ AdminId });

//         if (!categoryEntry) {
//             return res.status(404).json({ message: 'Category entry not found' });
//         }

//         const categoryIndex = categoryEntry.category.findIndex(cat => cat._id.toString() === categoryId);

//         if (categoryIndex === -1) {
//             return res.status(404).json({ message: 'Category not found' });
//         }

//         categoryEntry.category.splice(categoryIndex, 1);

//         await categoryEntry.save();

//         res.status(200).json({ message: 'Category deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting category:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

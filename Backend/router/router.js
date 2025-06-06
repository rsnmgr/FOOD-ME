import express from 'express';
import upload from '../middleware/multer.js'; // Import multer for image handling
import { authenticate } from '../middleware/Authenticate.js';
const router = express.Router();
//Super Admin
import {createSuper,fetchSuperById} from '../controller/UserController/Super.js';
router.post('/super', createSuper);
router.get('/fetchsuper/:id', fetchSuperById);

// Admin
import { createCustomer, fetchCustomers, fetchCustomerById, updateCustomer, deleteCustomer,updateCustomerImage,deleteCustomerImage,updateCustomerPassword } from '../controller/UserController/Admin.js';
router.post('/create', upload.single('image'), createCustomer);
router.get('/fetchAll', fetchCustomers);
router.get('/fetch/:id', fetchCustomerById);
router.put('/update/:id', upload.single('image'), updateCustomer);
router.delete('/delete/:id', deleteCustomer);
router.put('/updateImage/:id', upload.single('image'), updateCustomerImage);
router.delete('/deleteImage/:userId', deleteCustomerImage);
router.put('/updatePassword/:userId',updateCustomerPassword);

// //Users
// import { userRegister } from '../controller/Online/userController.js';
// router.post('/register', userRegister);

// Customer
import {addCustomer,validCustomer,getCustomer,getCustomerById} from '../controller/Customer/Customer.js' ;
router.post('/add-customer', addCustomer);
router.get('/valid-customer',authenticate, validCustomer);
router.get('/get-customer/:AdminId', getCustomer);
router.get('/get-customer/:AdminId/:customerId', getCustomerById);
// Multi-login
import { login,validUser,logOut } from '../controller/MultiLogin/Login.js';
router.post('/login', login);
router.get('/validUser',authenticate, validUser);
router.get('/logout', authenticate, logOut);

// Password Reset
import { forgotPassword, resetPassword } from '../controller/MultiLogin/PasswordReset.js';
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Menu Category
import {addCategory,getCategories, getCategoryById,updateCategory,deleteCategory} from '../controller/admin/menu/Category.js';
router.post('/category', addCategory);
router.get('/categories/:AdminId', getCategories);
router.get('/category/:AdminId/:categoryId', getCategoryById);
router.put('/category/:AdminId/:categoryId', updateCategory);
router.delete('/category/:AdminId/:categoryId', deleteCategory);

// Menu Units
import {addUnit, getUnits, getUnitById, updateUnit, deleteUnit} from '../controller/admin/menu/Units.js';
router.post('/unit', addUnit);
router.get('/units/:AdminId', getUnits);
router.get('/unit/:AdminId/:unitId', getUnitById);
router.put('/unit/:AdminId/:unitId', updateUnit);
router.delete('/unit/:AdminId/:unitId', deleteUnit);

// Menu Product
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controller/admin/menu/Products.js';
router.post('/products', upload.single('image'), addProduct);
router.get('/products/:AdminId', getProducts);
router.get('/products/:AdminId/:productId', getProductById);
router.put('/products/:AdminId/:productId', upload.single('image'), updateProduct);
router.delete('/products/:AdminId/:productId', deleteProduct);

// // Staff Category
// import { addStaffCategory,getStaffCategories,getStaffCategoryById,updateStaffCategory,deleteStaffCategory } from '../controller/admin/staff/Category.js';
// router.post('/staff-category',addStaffCategory);
// router.get('/staff-category/:AdminId',getStaffCategories);
// router.get('/staff-category/:AdminId/:categoryId', getStaffCategoryById);
// router.put('/staff-category/:AdminId/:categoryId', updateStaffCategory);
// router.delete('/staff-category/:AdminId/:categoryId', deleteStaffCategory);

// Staff Details
import { addDetail, getDetails, getDetailById, updateDetail, deleteDetail } from '../controller/admin/staff/Details.js';
router.post('/details', upload.single('image'), addDetail);
router.get('/details/:AdminId', getDetails);
router.get('/details/:AdminId/:detailId', getDetailById);
router.put('/details/:AdminId/:detailId', upload.single('image'), updateDetail);
router.delete('/details/:AdminId/:detailId', deleteDetail);

// Table
import {addTable,getTables,getTableById,updateTable,deleteTable} from '../controller/admin/tables/Table.js';
router.post('/tables', addTable);
router.get('/tables/:AdminId', getTables);
router.get('/tables/:AdminId/:tableId', getTableById);
router.put('/tables/:AdminId/:tableId', updateTable);
router.delete('/tables/:AdminId/:tableId', deleteTable);

// Selected Items
import { addSelectedItems,fetchSelectedItems,deleteSelectedItem,updateItemInstructions,updateItemQuantity,deleteAllSelectedItems } from '../controller/Customer/SelectedItems.js'; // Adjust the path as necessary
router.post("/add-selected-items", addSelectedItems);
router.get("/selected-items/:AdminId/:tableId/:CustomerId", fetchSelectedItems);
router.delete("/selected-items/:AdminId/:tableId/:CustomerId/:itemId", deleteSelectedItem);
router.put("/update-item-instructions/:AdminId/:tableId/:CustomerId/:itemId", updateItemInstructions);
router.put("/selected-items/:AdminId/:tableId/:CustomerId/:itemId/quantity", updateItemQuantity);
router.delete("/delete-selected-items/:AdminId/:tableId/:CustomerId", deleteAllSelectedItems);



// Order
import { addOrder, fetchOrders,fetchOrdersbyCustomerId,fetchOrdersByAdminId,deleteOrder,updateOrderStatus,OrdersTable,deleteOrderHistory,editOrderItem,deleteOrderItem,markNotificationSeen,countUnseenNotifications} from '../controller/Customer/AddOrder.js'; // Adjust the path as necessary
router.post('/add-order', addOrder);
router.get('/fetch-orders/:AdminId/:tableId', fetchOrders);
router.get('/fetch-orders/:AdminId/:tableId/:CustomerId', fetchOrdersbyCustomerId);
router.get('/fetch-orders/:AdminId', fetchOrdersByAdminId);
router.get('/orders/:AdminId', OrdersTable);

router.put('/markNotificationSeen/:adminId/:tableId/:orderHistoryId', markNotificationSeen);
router.get('/countUnseenNotifications/:adminId', countUnseenNotifications);


router.delete('/orders/:AdminId/:tableId', deleteOrder);
router.put('/update-order-status/:adminId/:tableId/:orderId', updateOrderStatus);
router.delete('/delete-order-id/:adminId/:tableId/:orderId', deleteOrderHistory);

router.put("/order/item/edit/:adminId/:tableId/:orderHistoryId/:itemId", editOrderItem);
router.delete("/order/item/delete/:adminId/:tableId/:orderHistoryId/:itemId", deleteOrderItem);

// Salse Report
import {addSalesReport,getAllSalesReports,deleteSale,getSalesByCustomerAndAdmin} from '../controller/admin/reports/reports.js';
router.post('/add-report', addSalesReport);
router.get('/fetch-report/:adminId',getAllSalesReports);
router.delete('/sales/delete/:adminId/:saleId',deleteSale)
router.get("/sales/:adminId/:customerId", getSalesByCustomerAndAdmin);

//Purchase Reports
import { addPurchase, getPurchases, getPurchaseById, updatePurchase, deletePurchase } from '../controller/admin/reports/purchase.js';
router.post('/purchases', upload.single('image'), addPurchase);
router.get('/purchases/:AdminId', getPurchases);
router.get('/purchases/:AdminId/:purchaseId', getPurchaseById);
router.put('/purchases/:AdminId/:purchaseId', upload.single('image'), updatePurchase);
router.delete('/purchases/:AdminId/:purchaseId', deletePurchase);


// user request
import {reqmessage,getmessage,deletemessage} from '../controller/labding/message.js'
router.post('/message',reqmessage);
router.get('/message',getmessage);
router.delete('/message/:id',deletemessage)

// Ip Address
import { addIpForAdmin, getIpsByAdmin, deleteIpForAdmin } from '../controller/IpAddress/ip.js';
router.post('/add-ip', addIpForAdmin);
router.get('/get-ip/:AdminId', getIpsByAdmin);
router.delete('/delete-ip', deleteIpForAdmin);

import { getServerLocalIP } from '../controller/Ip/ipAddress.js'
router.get('/server-ip', getServerLocalIP);
export default router;

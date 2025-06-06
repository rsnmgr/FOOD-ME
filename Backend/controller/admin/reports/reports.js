import Report from "../../../model/admin/report/sales.js";
import { io } from "../../../server.js";
import Order from "../../../model/customer/AddOrder.js";
export const addSalesReport = async (req, res) => {
    const {
        adminId, tableId, CustomerId, items,
        SubtotalAmmount, Discount, DiscountAmmount,
        vatPercentage, vatAmount,
        totalAmmount, paymentType
    } = req.body;


    if (totalAmmount <= 0) {
        return res.status(400).json({ message: "Total amount must be greater than 0." });
    }

    if (vatPercentage < 0 || vatAmount < 0) {
        return res.status(400).json({ message: "VAT values must be non-negative." });
    }

    try {
        const status = paymentType === "Due" ? "unpaid" : "paid";

        const newReportEntry = {
            tableId,
            CustomerId,
            items,
            SubtotalAmmount,
            Discount,
            DiscountAmmount,
            vatPercentage,
            vatAmount,
            totalAmmount,
            paymentType,
            status,
        };


        let order = await Order.findOne({ AdminId: adminId, tableId });

        if (!order) {
            console.error("Order not found for AdminId:", adminId, "TableId:", tableId);
            return res.status(404).json({ message: "Order not found." });
        }

        const orderHistory = order.OrderHistory || [];

        const allItemsFinished = orderHistory.every(item => item.itemsStatus === "Finished");

        if (!allItemsFinished) {
            return res.status(400).json({ message: "All items must have 'Finished' status before bill settlement." });
        }

        let report = await Report.findOne({ adminId });

        if (report) {
            report.sales.push(newReportEntry);
        } else {
            report = new Report({
                adminId,
                sales: [newReportEntry]
            });
        }

        try {
            await report.save();
            res.status(200).json({ message: "Report added successfully" });
            io.emit("reportAdded", report);
        } catch (error) {
            console.error("Validation error:", error);
            return res.status(400).json({ message: "Validation error", error: error.message });
        }

    } catch (error) {
        console.error("Error adding sales report:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};




// Fetch all sales reports for the given adminId
export const getAllSalesReports = async (req,res)=>{
    const {adminId} = req.params;
    
    // Check if adminId is undefined or not valid
    if (!adminId || adminId === 'undefined') {
        return res.status(400).json({ message: 'Invalid adminId provided' });
    }
    
    try {
        const report = await Report.findOne({adminId:adminId});
        if (!report) {
            return res.status(404).json({ message: "No sales report found for this admin." });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching sales reports:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}


export const deleteSale = async (req, res) => {
    const { adminId, saleId } = req.params;

    try {
        const report = await Report.findOne({ adminId });

        if (!report) {
            return res.status(404).json({ message: "No sales report found for this admin." });
        }

        // Filter out the sale to be deleted
        const updatedSales = report.sales.filter(sale => sale._id.toString() !== saleId);

        // If no change in length, saleId was not found
        if (updatedSales.length === report.sales.length) {
            return res.status(404).json({ message: "Sale entry not found" });
        }

        // Update and save the report
        report.sales = updatedSales;
        await report.save();

        res.status(200).json({ message: "Sale deleted successfully" });
        io.emit("saleDeleted", { adminId, saleId });

    } catch (error) {
        console.error("Error deleting sale:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


export const getSalesByCustomerAndAdmin = async (req, res) => {
    const { adminId, customerId } = req.params;

    try {
        const report = await Report.findOne({ adminId });

        if (!report) {
            return res.status(404).json({ message: "No sales report found for this admin." });
        }

        const filteredSales = report.sales.filter(sale =>
            sale.CustomerId?.toString() === customerId
        );

        if (filteredSales.length === 0) {
            return res.status(404).json({ message: "No sales found for this customer." });
        }

        res.status(200).json({ adminId, sales: filteredSales });
    } catch (error) {
        console.error("Error fetching sales by customer and admin:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};



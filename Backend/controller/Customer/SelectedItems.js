import SelectedItems from "../../model/customer/SelectedItems.js"; // Adjust the path as necessary
import Order from "../../model/customer/AddOrder.js";
import { io } from "../../server.js";
import Ip from "../../model/IpModel/Ip.js";

// Add or update selected items
export const addSelectedItems = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId, selectedItems,ipAddress } = req.body;
    // Check if the ipAddress exists in any entry under ips[] for the given AdminId
    const ipRecord = await Ip.findOne({
      AdminId,
      ips: { $elemMatch: { ip: ipAddress } }
    });
    if (!ipRecord) {
      return res.status(403).json({ message: "Please connect to restaurant WiFi to continue." });
    }
    // Check if the table is already booked (an order already exists)
    const existingOrder = await Order.findOne({ AdminId, tableId });
    
    // If an order exists, check if the CustomerId matches the one in the OrderHistory
    if (existingOrder) {
      const customerOrder = existingOrder.CustomerId === CustomerId;

      if (!customerOrder) {
        // If the CustomerId does not match any existing orders for this table
        return res.status(400).json({ message: "Sorry, this table is already booked by another customer, we can't process ahead." });
      }
    }

    // Find the existing selected items for the customer
    let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (selectedItemsEntry) {
      // Update the quantities or add new items
      selectedItems.forEach((newItem) => {
        const existingItem = selectedItemsEntry.selectedItems.find(
          (item) => item.name === newItem.name && item.size === newItem.size
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          selectedItemsEntry.selectedItems.push(newItem);
        }
      });
    } else {
      // Create a new selected items entry if it doesn't exist
      selectedItemsEntry = new SelectedItems({
        AdminId,
        tableId,
        CustomerId,
        selectedItems,
      });
    }

    // Save the selected items entry
    await selectedItemsEntry.save();

    // Emit the "ItemsAdded" event to notify the front end
    io.emit("ItemsAdded", selectedItemsEntry);

    res.status(201).json({
      message: "Selected items added successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    // console.error("Error adding selected items:", error);
    // res.status(500).json({ message: "Server error" });
  }
};



// Fetch selected items
export const fetchSelectedItems = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId } = req.params;

    const selectedItemsEntry = await SelectedItems.findOne({
      AdminId,
      tableId,
      CustomerId,
    });

    if (!selectedItemsEntry) {
      return res.status(404).json({
        message: "No selected items found for this Admin, table, and customer.",
      });
    }

    res.status(200).json({
      message: "Selected items fetched successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    // console.error("Error fetching selected items:", error);
    // res.status(500).json({ message: "Server error" });
  }
};

// Delete a single selected item
export const deleteSelectedItem = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId, itemId } = req.params;

    let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (!selectedItemsEntry) {
      return res.status(404).json({ message: "No selected items found." });
    }

    selectedItemsEntry.selectedItems = selectedItemsEntry.selectedItems.filter(
      (item) => item._id.toString() !== itemId
    );

    await selectedItemsEntry.save();
    io.emit("ItemsDeleted", selectedItemsEntry);

    res.status(200).json({
      message: "Selected item deleted successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    // console.error("Error deleting selected item:", error);
    // res.status(500).json({ message: "Server error" });
  }
};

// Update item instructions
export const updateItemInstructions = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId, itemId } = req.params;
    const { instructions } = req.body;

    let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (!selectedItemsEntry) {
      return res.status(404).json({ message: "No selected items found." });
    }

    const item = selectedItemsEntry.selectedItems.id(itemId);
    if (item) {
      item.instructions = instructions;
      await selectedItemsEntry.save();
      io.emit("ItemsUpdated", selectedItemsEntry);
      res.status(200).json({
        message: "Item instructions updated successfully",
        selectedItemsEntry,
      });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    // console.error("Error updating item instructions:", error);
    // res.status(500).json({ message: "Server error" });
  }
};

// Update item quantity
export const updateItemQuantity = async (req, res) => {
  const { AdminId, tableId, CustomerId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (!selectedItemsEntry) {
      return res.status(404).send("Items not found.");
    }

    const item = selectedItemsEntry.selectedItems.id(itemId);
    if (!item) {
      return res.status(404).send("Item not found");
    }

    item.quantity = quantity;
    await selectedItemsEntry.save();
    io.emit("ItemsQtyUpdated", selectedItemsEntry);

    res.status(200).json({
      message: "Item quantity updated successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    // console.error("Error updating item quantity:", error);
    // res.status(500).json({ message: "Server error" });
  }
};

// Delete all selected items
export const deleteAllSelectedItems = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId } = req.params;

    const deletedEntry = await SelectedItems.findOneAndDelete({
      AdminId,
      tableId,
      CustomerId,
    });

    if (!deletedEntry) {
      return res.status(404).json({ message: "No selected items found." });
    }

    io.emit("ItemsDeletedAll", { AdminId, tableId, CustomerId });

    res.status(200).json({
      message: "Selected items collection deleted successfully",
      deletedEntry,
    });
  } catch (error) {
    console.error("Error deleting selected items collection:", error);
    res.status(500).json({ message: "Server error" });
  }
};

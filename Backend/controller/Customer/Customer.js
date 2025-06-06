import Customer from "../../model/customer/Customer.js";
import Ip from "../../model/IpModel/Ip.js";

export const addCustomer = async (req, res) => {
  const { name, phone, adminId, tableId, ipAddress } = req.body;
  try {
    // ✅ Step 1: Check if ipAddress exists in any entry under ips[] for the given adminId
    const ipRecord = await Ip.findOne({
      AdminId: adminId,
      ips: { $elemMatch: { ip: ipAddress } }
    });

    if (!ipRecord) {
      return res.status(403).json({ message: "Please connect to restaurant WiFi to continue." });
    }

    // ✅ Step 2: Handle existing phone number (non-guest)
    if (phone && !phone.startsWith("guest-")) {
      let customer = await Customer.findOne({ phone });

      if (customer) {
        customer.name = name || customer.name;
        customer.adminId = adminId;
        customer.tableId = tableId;

        await customer.save();

        const token = await customer.generateAuthToken();
        return res.status(200).json({ customer, token, message: "Existing customer updated and logged in" });
      }
    }

    // ✅ Step 3: Create new customer (guest or new phone)
    const customer = new Customer({
      name: name || "Guest",
      phone: phone || `guest-${Date.now()}`,
      adminId,
      tableId,
    });

    await customer.save();

    const token = await customer.generateAuthToken();
    res.status(201).json({ customer, token, message: "New customer created and logged in" });

  } catch (error) {
    console.error("Error processing customer:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};



export const validCustomer = async (req, res) => {
  try {
    const validUser = await Customer.findById(req.userId);

    if (!validUser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    res.status(200).json({ status: 200, validUser });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error });
  }
};


export const getCustomer = async (req, res) => {
  try {
    const { AdminId } = req.params; // Extract AdminId from params

    // Fetch customers based on the AdminId
    const customers = await Customer.find({ adminId: AdminId });

    if (!customers.length) {
      return res.status(404).json({ message: "No customers found for this admin" });
    }

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error fetching customers" });
  }
};


export const getCustomerById = async (req, res) => {
  try {
    const { AdminId, customerId } = req.params;

    const customer = await Customer.findOne({ adminId: AdminId, _id: customerId });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Server error fetching customer" });
  }
};

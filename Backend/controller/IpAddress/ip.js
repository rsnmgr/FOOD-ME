import Ip from "../../model/IpModel/Ip.js";

// Add IP to AdminId - append if not exists or create new
export const addIpForAdmin = async (req, res) => {
  try {
    const { AdminId, ip } = req.body;
    if (!AdminId || !ip) {
      return res.status(400).json({ message: "AdminId and ip are required" });
    }

    const existingRecord = await Ip.findOne({ AdminId });

    if (existingRecord) {
      // Check if IP already exists in the ips array
      const ipExists = existingRecord.ips.some(ipObj => ipObj.ip === ip);
      if (!ipExists) {
        existingRecord.ips.push({ ip }); // Add new IP object with current date defaulted
        await existingRecord.save();
      }
      return res.status(200).json({ message: "IP added to existing AdminId", data: existingRecord });
    } else {
      const newRecord = new Ip({ AdminId, ips: [{ ip }] });
      await newRecord.save();
      return res.status(201).json({ message: "New AdminId created with IP", data: newRecord });
    }
  } catch (error) {
    console.error("Error adding IP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get IPs for AdminId
export const getIpsByAdmin = async (req, res) => {
  try {
    const { AdminId } = req.params;
    if (!AdminId) {
      return res.status(400).json({ message: "AdminId is required" });
    }

    const record = await Ip.findOne({ AdminId });
    if (!record) {
      return res.status(404).json({ message: "AdminId not found" });
    }

    return res.status(200).json({ AdminId: record.AdminId, ips: record.ips });
  } catch (error) {
    console.error("Error fetching IPs:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete IP for AdminId
export const deleteIpForAdmin = async (req, res) => {
  try {
    const { AdminId, ip } = req.body;
    if (!AdminId || !ip) {
      return res.status(400).json({ message: "AdminId and ip are required" });
    }

    const record = await Ip.findOne({ AdminId });
    if (!record) {
      return res.status(404).json({ message: "AdminId not found" });
    }

    // Find index of IP object with the matching ip string
    const ipIndex = record.ips.findIndex(ipObj => ipObj.ip === ip);
    if (ipIndex === -1) {
      return res.status(404).json({ message: "IP not found in the list" });
    }

    record.ips.splice(ipIndex, 1);
    await record.save();

    return res.status(200).json({ message: "IP removed successfully", data: record });
  } catch (error) {
    console.error("Error deleting IP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

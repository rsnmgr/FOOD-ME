import mongoose from "mongoose";

const ipSchema = new mongoose.Schema({
  AdminId: { type: String, required: true },
  ips: [{
    ip: { type: String, required: true },
    Date: { type: Date, default: Date.now }
}]
});

const Ip = mongoose.model("Ip", ipSchema);

export default Ip;

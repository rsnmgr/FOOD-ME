import Message from "../../model/landing/message.js";

export const reqmessage = async(req,res)=>{
    try {
        const {name,phone,email,message} = req.body;
        const newmessage = new Message({name,phone,email,message});
        await newmessage.save();
        res.status(201).json({ success: true, message: "Message send successfully!" });
    } catch (error) {
        
    }
}

export const getmessage = async(req,res)=>{
    try {
        const messages = await Message.find();
        res.status(200).json({ success: true, messages });
    } catch (error) {
        
    }
}

export const deletemessage = async (req, res) => {
  try {
    const { id } = req.params; 
    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};

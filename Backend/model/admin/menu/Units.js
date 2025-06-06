import mongoose from 'mongoose';

const unitsSchema = new mongoose.Schema({
    AdminId: { type: String, required: true },
    units: [{
        name: { type: String, required: true },
        status: { type: String, required: true }
    }]
});

const Units = mongoose.model('Units', unitsSchema);

export default Units;

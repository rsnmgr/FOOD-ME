import mongoose from 'mongoose';
const createTable = new mongoose.Schema({
    AdminId:{type: 'string', required: true},
    table:[{
        name:{
            type:String,
            required:true
        },
        department:{
            type:String,
        },
        status:{
            type:String,
            required:true,
        }
    }]
});

const Table = mongoose.model('Table', createTable);

export default Table;
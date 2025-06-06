import Table from '../../../model/admin/tables/Table.js';
import { io } from '../../../server.js';
// Add a new table entry
export const addTable = async (req, res) => {
    try {
        const { AdminId, name, department, status } = req.body;
        let tableEntry = await Table.findOne({ AdminId });

        if (tableEntry) {
            // Check if the table name already exists (case-insensitive)
            const isDuplicate = tableEntry.table.some(table => table.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                return res.status(400).json({ message: 'Table name already exists ' });
            }

            tableEntry.table.push({ name, department, status });
        } else {
            tableEntry = new Table({
                AdminId,
                table: [{ name, department, status }]
            });
        }

        await tableEntry.save();
        io.emit('tableAdded', tableEntry);

        res.status(201).json({ message: 'Table entry added successfully', tableEntry });
    } catch (error) {
        console.error('Error adding table entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};





// Fetch all table entries for a specific AdminId
export const getTables = async (req, res) => {
    try {
        const { AdminId } = req.params;
        // console.log('AdminId received:', AdminId);

        const tableEntry = await Table.findOne({ AdminId });

        if (!tableEntry || !tableEntry.table) {
            return res.status(404).json({ message: 'No table entries found for this AdminId' });
        }

        res.status(200).json({ tables: tableEntry.table });
    } catch (error) {
        console.error('Error fetching table entries:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Fetch a specific table entry by its ID
export const getTableById = async (req, res) => {
    try {
        const { AdminId, tableId } = req.params;
        const tableEntry = await Table.findOne({ AdminId });

        if (!tableEntry) {
            return res.status(404).json({ message: 'Table entry not found' });
        }

        const table = tableEntry.table.id(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table entry not found' });
        }

        res.status(200).json({ table });
    } catch (error) {
        console.error('Error fetching table entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific table entry
export const updateTable = async (req, res) => {
    try {
        const { AdminId, tableId } = req.params;
        const { name, department, status } = req.body;

        const tableEntry = await Table.findOne({ AdminId });

        if (!tableEntry) {
            return res.status(404).json({ message: 'Table entry not found' });
        }

        const table = tableEntry.table.id(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table entry not found' });
        }

        // Check if the new name conflicts with another existing table (case-insensitive)
        if (name && table.name.toLowerCase() !== name.toLowerCase()) {
            const isDuplicate = tableEntry.table.some(tab => tab.name.toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                return res.status(400).json({ message: 'Table name already exists ' });
            }
        }

        table.name = name || table.name;
        table.department = department || table.department;
        table.status = status || table.status;

        await tableEntry.save();
        io.emit('tableUpdated', tableEntry);

        res.status(200).json({ message: 'Table entry updated successfully', table });
    } catch (error) {
        console.error('Error updating table entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete a specific table entry
export const deleteTable = async (req, res) => {
    try {
        const { AdminId, tableId } = req.params;

        const tableEntry = await Table.findOne({ AdminId });

        if (!tableEntry) {
            return res.status(404).json({ message: 'Table entry not found' });
        }

        const tableIndex = tableEntry.table.findIndex(tab => tab._id.toString() === tableId);

        if (tableIndex === -1) {
            return res.status(404).json({ message: 'Table entry not found' });
        }

        tableEntry.table.splice(tableIndex, 1);

        await tableEntry.save();
        io.emit('tableDeleted', tableEntry);

        res.status(200).json({ message: 'Table entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting table entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


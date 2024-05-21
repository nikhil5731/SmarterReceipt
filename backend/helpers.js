const { Inventory } = require('./db');
const mongoose = require('mongoose');

async function generateUniqueInventoryId() {
    let inventoryId;
    let isUnique = false;

    while (!isUnique) {
        inventoryId = new mongoose.Types.ObjectId(); // Generate new ObjectId
        const existingInventory = await Inventory.findOne({ _id: inventoryId });
        if (!existingInventory) {
            isUnique = true;
        }
    }

    return inventoryId;
}

module.exports = { generateUniqueInventoryId };

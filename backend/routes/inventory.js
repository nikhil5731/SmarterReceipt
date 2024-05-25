const express = require('express');
const { isAuthenticated } = require('../middleware/auth'); // Correct import
const { Inventory, User } = require('../db');
const axios = require("axios");
const router = express.Router();
const { generateUniqueInventoryId } = require('../helpers');

router.post('/addProduct', isAuthenticated, async (req, res) => {
    try {
        const { product } = req.body;
        if (!product.name || !product.price || product.quantity === undefined) {
            return res.status(400).send('Invalid product data');
        }

        let inventory = await Inventory.findById(req.user.InventoryId);
        if (!inventory) {
            inventory = new Inventory({ _id: req.user.InventoryId, products: [] });
        }

        inventory.products.push(product);
        await inventory.save();
        res.send(inventory);
    } catch (err) {
        res.status(500).send('Error updating inventory');
    }
});

router.get('/get/:id', isAuthenticated, async (req, res) => {
    try {
        let inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            inventory = new Inventory({ _id: req.params.id, products: [] });
            await inventory.save();
        }
        res.send(inventory);
    } catch (err) {
        res.status(500).send('Error fetching inventory');
    }
});

router.delete('/delete_inventory', isAuthenticated, async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.user.InventoryId);
        req.user.InventoryId = await generateUniqueInventoryId();
        await req.user.save();
        res.send({ success: true });
    } catch (err) {
        res.status(500).send('Error deleting inventory');
    }
});

router.get('/products_to_restock', isAuthenticated, async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.user.InventoryId);
        if (!inventory) {
            return res.status(404).send('Inventory not found');
        }
        const productsToRestock = inventory.products.filter(product => product.quantity <= 5);
        res.send(productsToRestock);
    } catch (err) {
        res.status(500).send('Error fetching products to restock');
    }
});

router.get('/product_details/:barcode', isAuthenticated, async (req, res) => {
    try {
        const barcode = req.params.barcode;
        const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}`);

        if (response.data && response.data.product && response.data.product.product_name) {
            const product = response.data.product;
            const frontImageUrl = product.selected_images?.front?.display?.en || product.selected_images?.front?.display?.fr || product.selected_images?.front?.display?.es;

            res.send({
                name: product.product_name,
                image: frontImageUrl
            });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Error fetching product details');
    }
});

router.get('/monthly-sales/:userId', isAuthenticated, async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).send('Inventory not found');
        }

        const monthlySales = inventory.MonthlySales;
        res.json({ monthlySales });
    } catch (err) {
        res.status(500).send('Error fetching monthly sales');
    }
});

router.post('/update', isAuthenticated, async (req, res) => {
    const { userId, index, name, price, quantity, image } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        // Update the specific item by index
        inventory.products[index] = { ...inventory.products[index], name, price, quantity, image };
        
        await inventory.save();

        res.json({ success: true, item: inventory.products[index] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating item', error: err });
    }
});

router.delete('/delete', async (req, res) => {
    const { userId, index } = req.body;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        // Remove the specific item by index
        inventory.products.splice(index, 1);
        
        await inventory.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting item', error: err });
    }
});

module.exports = router;

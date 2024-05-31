const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const {Inventory, User, Products} = require('../db');
const axios = require("axios");
const router = express.Router();
const {generateUniqueInventoryId} = require('../helpers');

// Add Product Route
router.post('/addProduct', isAuthenticated, async (req, res) => {
    try {
        const {product} = req.body;
        console.log(product);
        if (!product.name || !product.price || product.quantity === undefined) {
            return res.status(400).send('Invalid product data');
        }

        let inventory = await Inventory.findById(req.user.InventoryId);
        if (!inventory) {
            inventory = new Inventory({_id: req.user.InventoryId, products: []});
        }

        // Check if the product already exists in the inventory
        const existingProduct = inventory.products.find(p => p.name === product.name);
        // console.log(existingProduct);

        if (existingProduct) {
            // Product exists, update its quantity
            existingProduct.quantity += product.quantity;
        } else {
            // Product does not exist, add it to the inventory
            inventory.products.push(product);
        }

        await inventory.save();
        res.send(inventory);
    } catch (err) {
        res.status(500).send('Error updating inventory');
    }
});


// Get Inventory by ID Route
router.get('/get/:id', isAuthenticated, async (req, res) => {
    try {
        let inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            inventory = new Inventory({_id: req.params.id, products: []});
            await inventory.save();
        }
        res.send(inventory);
    } catch (err) {
        res.status(500).send('Error fetching inventory');
    }
});

// Delete Inventory Route
router.delete('/delete_inventory', isAuthenticated, async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.user.InventoryId);
        req.user.InventoryId = await generateUniqueInventoryId();
        await req.user.save();
        res.send({success: true});
    } catch (err) {
        res.status(500).send('Error deleting inventory');
    }
});

// Get Products to Restock Route
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

// Get Product Details by Barcode Route
router.get('/product_details/:barcode', isAuthenticated, async (req, res) => {
    const barcode = req.params.barcode;

    try {
        // First, check if the product is in the local database
        const product = await Products.findOne({ barcode: barcode });

        if (product) {
            // If found in the local database, return it
            return res.send({
                name: product.name,
                image: product.image,
            });
        }

        // If not found in the local database, fetch from the Open Food Facts API
        try {
            const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

            if (response.data && response.data.product && response.data.product.product_name) {
                const fetchedProduct = response.data.product;
                const frontImageUrl = fetchedProduct.selected_images?.front?.display?.en || fetchedProduct.selected_images?.front?.display?.fr || fetchedProduct.selected_images?.front?.display?.es;

                // Save the product to the database
                const newProduct = new Products({
                    barcode: fetchedProduct.code,
                    name: fetchedProduct.product_name,
                    image: frontImageUrl
                });

                await newProduct.save();

                // Return the fetched product
                return res.send({
                    name: fetchedProduct.product_name,
                    image: frontImageUrl
                });
            } else {
                return res.status(404).send('Product not found');
            }
        } catch (apiError) {
            console.error('Error fetching product details from API:', apiError);
            return res.status(500).send('Error fetching product details from API');
        }
    } catch (dbError) {
        console.error('Error fetching product details from database:', dbError);
        return res.status(500).send('Error fetching product details from database');
    }
});

// Get Monthly Sales Route
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
        res.json({monthlySales});
    } catch (err) {
        res.status(500).send('Error fetching monthly sales');
    }
});

// Update Product Route
router.post('/update', isAuthenticated, async (req, res) => {
    const {userId, index, name, price, quantity, image} = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({success: false, message: 'Inventory not found'});
        }

        // Update the specific item by index
        inventory.products[index] = {...inventory.products[index], name, price, quantity, image};

        await inventory.save();

        res.json({success: true, item: inventory.products[index]});
    } catch (err) {
        res.status(500).json({success: false, message: 'Error updating item', error: err});
    }
});

// Delete Product Route
router.delete('/delete', isAuthenticated, async (req, res) => {
    const {userId, index} = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({success: false, message: 'Inventory not found'});
        }

        inventory.products.splice(index, 1);

        await inventory.save();

        res.json({success: true});
    } catch (err) {
        res.status(500).json({success: false, message: 'Error deleting item', error: err});
    }
});

// Get Product Price Route
router.get('/product_price/:name', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const inventory = await Inventory.findById(user.InventoryId);

        if (!inventory) {
            return res.status(404).json({success: false, message: 'Inventory not found'});
        }

        const name = decodeURIComponent(req.params.name);

        const product = inventory.products.find(product => product.name === name);
        if (!product) {
            return res.status(404).json({success: false, message: 'Product not found'});
        }

        const price = product.price;
        const quantity = product.quantity;
        res.json({success: true, price: price, quantity: quantity});
    } catch (error) {
        console.error('Error fetching product price:', error);
        res.status(500).json({success: false, message: 'Internal server error'});
    }
});

router.put('/update_inventory', isAuthenticated, async (req, res) => {
    const {products, totalPrice} = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({success: false, message: 'Inventory not found'});
        }

        const now = new Date();
        const currentDate = now.toISOString();
        const currentMonth = now.getMonth();
        const newOrderNumber = inventory.transactions.length + 1;

        inventory.transactions.push({date: currentDate, items: products});

        // Reset MonthlySales array if today is January 1st
        if (currentMonth === 0 && currentDate === 1) {
            inventory.MonthlySales = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        // Update the sales for the current month
        inventory.MonthlySales[currentMonth] += totalPrice;

        // Reduce the quantity of each product in the inventory
        products.forEach(purchasedProduct => {
            const inventoryProduct = inventory.products.find(prod => prod.name === purchasedProduct.name);
            if (inventoryProduct) {
                inventoryProduct.quantity -= purchasedProduct.quantity;
            }
        });

        // Save the updated inventory
        await inventory.save();

        res.status(200).json({
            success: true,
            message: 'Inventory updated successfully',
            shopName: user.ShopName,
            orderNumber: newOrderNumber
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Get Transactions Route
router.get('/transactions', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({success: false, message: 'Inventory not found'});
        }

        res.json(inventory.transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    }
});

// Delete Transactions Route
router.delete('/delete_transactions', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const inventory = await Inventory.findById(user.InventoryId);
        inventory.transactions = [];
        await inventory.save();
        res.json({success: true, message: 'Transactions deleted successfully'});
    } catch (error) {
        console.error('Error deleting transactions:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

// Fetch transaction by shop name and order number
router.get('/:shopName/:orderNumber', async (req, res) => {
    const {shopName, orderNumber} = req.params;

    try {
        const user = await User.findOne({ShopName: shopName});
        if (!user) {
            return res.status(404).json({success: false, message: 'Shop not found'});
        }

        const inventory = await Inventory.findById(user.InventoryId);
        if (!inventory) {
            return res.status(404).json({success: false, message: 'Inventory not found'});
        }

        const orderIndex = parseInt(orderNumber, 10); // Convert orderNumber to zero-based index
        if (orderIndex < 0 || orderIndex >= inventory.transactions.length) {
            return res.status(404).json({success: false, message: 'Order not found'});
        }

        const transaction = inventory.transactions[orderIndex];
        res.status(200).json({success: true, transaction});
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});
// router.get('/indian-products', async (req, res) => {
//     try {
//         const {data} = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
//             params: {
//                 json: true,
//                 page: 1,
//                 action: 'process',
//                 tagtype_0: 'countries',
//                 tag_contains_0: 'contains',
//                 tag_0: 'india',
//                 page_size: 20, // Adjust the page size as needed
//             },
//         });
//
//         // Map through the products and create a JSON object with only barcode, name, and image
//         const products = data.products.map(product => ({
//             barcode: product.code,
//             name: product.product_name,
//             image: product.image_url,
//         }));
//
//         // await Products.insertMany(products);
//
//         res.json(products);
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).send('Error fetching products');
//     }
// });

module.exports = router;

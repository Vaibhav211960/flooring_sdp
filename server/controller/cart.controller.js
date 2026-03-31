import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

const BOX_QUANTITY = 10;

const normalizeBoxQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return NaN;
  return Math.trunc(quantity);
};

// Helper to get populated cart
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ userId })
    .populate("items.productId", "name image price unit stock");
};

/**
 * GET: Get the single cart for the user
 */
export const getMyCart = async (req, res) => {
  try {
    // 1. Correct: Use the Model name (Cart)
    // 2. Correct: Use findOne because we are looking for the 'userId' field
    // 3. Optional: Added populate so you get product details, not just IDs
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId", "name image price unit stock");

    if (!cart) {
      // If no cart exists yet, return an empty structure instead of an error
      return res.status(200).json({ items: [], cartTotal: 0 });
    }

    res.status(200).json(cart);
  } catch (err) {
    // Log the error to your terminal so you can see exactly what happened
    console.error("Cart Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * POST: Add item to cart (Upsert logic)
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const requestedQuantity = normalizeBoxQuantity(quantity);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (requestedQuantity < BOX_QUANTITY || requestedQuantity % BOX_QUANTITY !== 0) {
      return res.status(400).json({ message: `Quantity must be added in boxes of ${BOX_QUANTITY}.` });
    }

    const price = product.salePrice || product.price;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], cartTotal: 0 });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      const nextQuantity = cart.items[itemIndex].quantity + requestedQuantity;
      if (nextQuantity > product.stock) {
        return res.status(400).json({ message: "Requested quantity exceeds available stock." });
      }
      cart.items[itemIndex].quantity = nextQuantity;
      cart.items[itemIndex].total = cart.items[itemIndex].quantity * price;
    } else {
      if (requestedQuantity > product.stock) {
        return res.status(400).json({ message: "Requested quantity exceeds available stock." });
      }
      cart.items.push({ productId, quantity: requestedQuantity, price, total: price * requestedQuantity });
    }

    cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
    await cart.save();
    
    const updatedCart = await getPopulatedCart(userId);
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT: Update quantity
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const requestedQuantity = normalizeBoxQuantity(quantity);

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (requestedQuantity < BOX_QUANTITY || requestedQuantity % BOX_QUANTITY !== 0) {
      return res.status(400).json({ message: `Quantity must be updated in boxes of ${BOX_QUANTITY}.` });
    }
    if (requestedQuantity > product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = requestedQuantity;
      cart.items[itemIndex].total = cart.items[itemIndex].quantity * cart.items[itemIndex].price;
      
      cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
      await cart.save();
      
      const updatedCart = await getPopulatedCart(userId);
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE: Remove item
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
    
    await cart.save();
    const updatedCart = await getPopulatedCart(userId);
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE: Clear cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id; 
    await Cart.findOneAndUpdate({ userId }, { items: [], cartTotal: 0 });
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get all carts
 */
export const getAllCarts = async (req, res) => {  
  try {
    const carts = await Cart.find()
      .populate("userId", "username email")
      .populate("items.productId", "name image");
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  } 
};

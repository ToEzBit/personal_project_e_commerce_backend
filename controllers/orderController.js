const { Product, ProductImage, Order, OrderProduct } = require("../models");
const createError = require("../utils/createError");
exports.createOrder = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId, amount } = req.body;

    const product = await Product.findOne({ where: { id: productId } });
    if (!product) {
      createError("Product not found", 400);
    }

    const existOrder = await Order.findOne({
      where: {
        userId: id,
        status: "neworder",
      },
    });

    if (existOrder) {
      createError("You have an order in progress", 400);
    }

    const order = await Order.create({ userId: id, status: "neworder" });
    const orderProduct = await OrderProduct.create({
      orderId: order.id,
      productId,
      amount,
      price: product.price,
    });

    order.totalPrice = product.price * amount;
    order.save();
    res.json({ order, orderProduct });
  } catch (err) {
    next(err);
  }
};

exports.addOrderProduct = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { productId, amount } = req.body;

    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) {
      createError("Order not found", 400);
    }

    const product = await Product.findOne({ where: { id: productId } });
    if (!product) {
      createError("Product not found", 400);
    }

    const createdOrderProduct = await OrderProduct.create({
      orderId: order.id,
      productId,
      amount,
      price: product.price,
    });

    order.totalPrice += product.price * amount;
    await order.save();

    res.json({ order, createdOrderProduct });
  } catch (err) {
    next(err);
  }
};

exports.deleteOrderProduct = async (req, res, next) => {
  try {
    const { orderProductId } = req.params;

    const orderProduct = await OrderProduct.findOne({
      where: { id: orderProductId },
    });
    if (!orderProduct) {
      createError("OrderProduct not found", 400);
    }
    const order = await Order.findOne({ where: { id: orderProduct.orderId } });
    if (!order) {
      createError("Order not found", 400);
    }
    order.totalPrice -= orderProduct.price * orderProduct.amount;
    await order.save();
    await orderProduct.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) {
      createError("Order not found", 400);
    }

    const orderProducts = await OrderProduct.findAll({
      where: { orderId: order.id },
    });
    const orderProductId = [];
    orderProducts.map((el) => {
      orderProductId.push(el.id);
    });

    orderProductId.map(async (el) => {
      await OrderProduct.destroy({ where: { id: el } });
    });
    await order.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { id } = req.user;
    const orders = await Order.findAll({
      where: {
        userId: id,
      },
      include: [
        {
          model: OrderProduct,
          attributes: {
            exclude: ["createdAt", "updatedAt", "productId", "orderId"],
          },
          include: [
            {
              model: Product,
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "mainDescription",
                  "subDescription1",
                  "subDescription2",
                  "status",
                ],
              },
              include: {
                model: ProductImage,
                where: {
                  role: "thumbnail",
                },
                attributes: {
                  exclude: ["createdAt", "updatedAt", "publicId", "productId"],
                },
              },
            },
          ],
        },
      ],
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderProduct,
          attributes: {
            exclude: ["createdAt", "updatedAt", "productId", "orderId"],
          },
          include: [
            {
              model: Product,
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "mainDescription",
                  "subDescription1",
                  "subDescription2",
                  "status",
                ],
              },
              include: {
                model: ProductImage,
                where: {
                  role: "thumbnail",
                },
                attributes: {
                  exclude: ["createdAt", "updatedAt", "publicId", "productId"],
                },
              },
            },
          ],
        },
      ],
    });

    if (!order) {
      createError("Order not found", 400);
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

exports.checkoutOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({
      where: { id: orderId },
    });
    if (!order) {
      createError("Order not found", 400);
    }
    if (order.status === "checkout") {
      createError("Order already checked out", 400);
    }
    order.status = "checkout";
    await order.save();
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

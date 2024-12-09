const prisma = require("../config/prisma");

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    const orderUpdate = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: orderStatus },
    });
    res.json(orderUpdate);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "changeOrderStatus error" });
  }
};

exports.getOrderAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        orderedBy: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
    });
    res.json(orders);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "getOrderAdmin error" });
  }
};

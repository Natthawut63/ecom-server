const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;
//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUND_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    //console.log(title , description ,price ,quantity ,images)
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product Error" });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    const product = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(product);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product List Error" });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(product);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product Read Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    //clear images
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },

      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product Update Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    //รูปภาพ เข้าไปลบใน cloud ด้วย
    // step 1 ค้นหาร incloud image
    const product = await prisma.product.findFirst({
      where: { id: Number(id) },
      include: { images: true },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(product);

    // step 2 Promise ลบรูปภาพใน cloud ลบเเบบรอฉันด้วย
    const deletedImage = product.images.map(
      async (image) =>
        new Promise((resolve, reject) => {
          // delete cloudinary
          cloudinary.uploader.destroy(image.public_id, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        })
    );
    await Promise.all(deletedImage);

    // step 3 ลบรูปภาพใน database
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    res.send("Deleted Product Succes");
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product remove Error" });
  }
};

exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    const products = await prisma.product.findMany({
      take: limit, // ตามอะไร
      orderBy: { [sort]: order }, //desc-asc อยากรู้อะไร มากไปน้อย น้อยไปมาก
      include: { category: true, images: true },
    });

    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product List By Error" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(500).send("Search Query Error");
  }
};
const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0], //มากกว่า a0
          lte: priceRange[1], //น้อยกว่า a1
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(500).jsob({ msg: "Search Price Error" });
  }
};
const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(500).jsob({ msg: "Search Price Error" });
  }
};

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;
    if (query) {
      await handleQuery(req, res, query);
    }
    if (category) {
      await handleCategory(req, res, category);
    }
    if (price) {
      await handlePrice(req, res, price);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product search Filters Error" });
  }
};

exports.createImages = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `NTW-${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom2024",
    });

    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product Create Images Error" });
  }
};
exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove Image Success");
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "product Create Images Error" });
  }
};

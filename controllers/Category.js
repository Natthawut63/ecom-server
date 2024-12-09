const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const {name} = req.body
    const category = await prisma.category.create({
        data:{
            name:name
        }
    })
    res.send(category)
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "category create Error" });
  }
};

exports.list = async (req, res) => {
  try {
    const category = await prisma.category.findMany()
    res.send(category)
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "category list Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params
    const category = await prisma.category.delete({
        where:{
            id:Number(id)
        }
    })
    res.send(category)
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "category Remove error" });
  }
};

const productCollection = require('../models/schema/products')
const categuryCollection = require('../models/schema/categury')

module.exports = {

    addProduct: (productData) => {
        return new Promise((res, rej) => {
            const products = new productCollection
                ({
                    ProductName: productData.ProdName,
                    Price: productData.Price,
                    Categury: productData.Categury,
                    Description: productData.Description,
                    images: productData.img,
                    stock: productData.stock,
                    softRemove: true
                })
            products.save().then((data) => {
               // console.log("product added");
               // console.log(data);
               // console.log("====================");
                res(data)
            })
        })


    },
    getOneProduct: (prodId) => {
        return new Promise((res, rej) => {
            productCollection.findOne({ _id: prodId }).lean().then((data) => {
                //// console.log(data); 
                res(data)
            })
        })
    },
    editProduuctDetailes: (prodId, productData) => {
        return new Promise((res, rej) => {
            productCollection.updateOne({ _id: prodId }, {
                $set: {
                    ProductName: productData.ProdName,
                    Price: productData.Price,
                    Categury: productData.Categury,
                    Description: productData.Description,
                    stock: productData.stock
                }
            }).then((data) => {
               // console.log(data);
                res(data)
            })
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((res, rej) => {
            productCollection.updateOne({ _id: prodId }, {
                $set: {
                    softRemove: false
                }
            }).then((data) => {
                res(data)
            })
        })
    },
    recoverProduct: (prodId) => {
        return new Promise((res, rej) => {
            productCollection.updateOne({ _id: prodId }, {
                $set: {
                    softRemove: true
                }
            }).then((data) => {
                res(data)
            })
        })
    },
    recoverDeleteProduct: (prodId) => {
        return new Promise((res, rej) => {
            productCollection.updateOne({ _id: prodId }, {
                $set: {
                    softRemove: true
                }
            }).then((data) => {
                res(data)
            })
        })
    },
    getProductCategury: (productCategury) => {
        return new Promise((res, rej) => {
            productCollection.find({ Categury: productCategury })
                .lean()
                .then((data) => {
                   // console.log(data);
                    res(data)
                })
        })

    },
    getProductDetails: () => {
        return new Promise((res, rej) => {
            productCollection
                .find({ softRemove: true })
                .lean()
                .then((data) => {
                    res(data)
                })
        })
    },
    getCateguryList: () => {
        return new Promise((res, rej) => {
            categuryCollection.find({}).lean().then((data) => {
                //// console.log(data);
                res(data)
            })
        })

    },
    addNewCategury: (categuryData) => {
        return new Promise((res, rej) => {
            categuryCollection.findOne({ categuryName: categuryData.Name }).then((data) => {
                if (!data) {
                    const categury = new categuryCollection({
                        categuryName: categuryData.Name
                    })
                    categury.save().then((data) => {
                       // console.log(data);
                        res(data)
                    })
                } else {
                    rej({ categuryExist: true })
                }
            })

        })

    },
    removeCategury: (categuryId) => {
        return new Promise((res, rej) => {
            categuryCollection.deleteOne({ _id: categuryId }).then((data) => {
                res()
            })
        })

    },
    getRelatedProducts: (categoryName) => {
        return new Promise((res, rej) => {
            productCollection.find().lean().then((data) => {
                res(data)
            })
        })

    }
}


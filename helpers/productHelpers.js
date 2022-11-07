const productCollection = require('../models/schema/products')
const categuryCollection = require('../models/schema/categury')
const { default: mongoose } = require('mongoose')

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
                res(data)
            })
        })


    },
    getOneProduct: (prodId) => {
        return new Promise((res, rej) => {
            try{
                productCollection.findOne({ _id:mongoose.Types.ObjectId(prodId)}).lean().then((data) => {
                    if(data){
                        res(data)
                    }else{
                        rej({dataNull:true})
                    }             
                })
            }catch(err){
                rej({dataNull:true})
            }
            
        })
    },
    editProduuctDetailes: (prodId, productData) => {
        return new Promise((res, rej) => {
            try{
                productCollection.updateOne({ _id: prodId }, {
                    $set: {
                        ProductName: productData.ProdName,
                        Price: productData.Price,
                        Categury: productData.Categury,
                        Description: productData.Description,
                        stock: productData.stock
                    }
                }).then((data) => {
                    res(data)
                })
            }catch(err){
                rej({catchErr:true})
            }           
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((res, rej) => {
            try{
                productCollection.updateOne({ _id: prodId }, {
                    $set: {
                        softRemove: false
                    }
                }).then((data) => {
                    res(data)
                })
            }catch(err){
                rej({catchErr:true})
            }        
        })
    },
    recoverProduct: (prodId) => {
        return new Promise((res, rej) => {
            try{
                productCollection.updateOne({ _id: prodId }, {
                    $set: {
                        softRemove: true
                    }
                }).then((data) => {
                    res(data)
                })
            }catch(err){
                rej({catchErr:true})
            }          
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
            try{
                categuryCollection.find({}).lean().then((data) => {
                    res(data)
                })
            }catch(err){
                rej({catchErr:true})
            }
            
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
            productCollection.find({Categury:categoryName}).lean().then((data) => {
                if(data){
                    res(data)
                }else{
                    rej({dataNull:true})
                }  
            })
        })
    }
}

  
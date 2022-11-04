const multer = require('multer')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/banner-images')
    },
    filename:(req,file,cb)=>{
        const ext= file.originalname.substr(file.originalname.lastIndexOf('.'))
        cb(null,file.fieldname+'-'+Date.now()+ext)
    }
})

module.exports=bannerStore=multer({storage:storage})
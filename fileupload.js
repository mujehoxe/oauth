const multer = require('multer')

const upload = multer({ dest: './uploads/' })

//var multUpload = upload.fields([{ name: 'file', maxCount: 2 }])

//app.post('/api', /*upload.single('file'),*/multUpload, function (req, res) {
    // console.log(req.files)
// })

const app = require('express')();
const uploadFile = require('express-fileupload');
const multer = require('multer');

app.use(uploadFile());


app.post('/express/upload', (req, res)=>{
    // multer({fileFilter});
    res.send(req.files);
})

console.log('listening post : /exoress/upload ');
app.listen(3001);
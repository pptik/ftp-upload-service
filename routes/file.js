const express = require('express');
const router = express.Router();
const commonMsg = require('../configs/common_messages.json');
const path=require('path');
const multer = require('multer');
const UPLOAD_PATH = './public/temps/';
const {ftp}=require('../configs/basic');
let shortid = require('shortid');
let JSFtp = require("jsftp");
const fs=require('fs');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + '-' + Date.now()+path.extname(file.originalname))
    }

});
let upload = multer({ storage: storage }).single('docFile');
let uploadImage = multer({ storage: storage }).single('image');

router.post('/upload/single',function(req,res,next){
    try {
        console.log(req.file);
        upload(req,res,function (err) {
           if(err){
               console.log(err);
               res.status(200).send(commonMsg.upload_failed);
           }
           else {
               if(req.file){
                   let file =path.join(__dirname, '../public/temps/'+req.file.filename);
                   console.log(file);
                   let ftpDestFolderAndFileName="STORAGE/BANWASLU/DOCUMENTS/"+req.file.filename;
                   let fileHostingPath="http://filehosting.pptik.id/"+ftpDestFolderAndFileName;

                   let Ftp = new JSFtp({
                       host:ftp.pptik.host,
                       port: 21,
                       user: ftp.pptik.user,
                       pass: ftp.pptik.pass
                   });
                   Ftp.put(file, ftpDestFolderAndFileName, function(err) {
                       if (err) console.log(err);
                       else {
                           fs.unlink(file,(err => {
                               if(err)console.log(err);
                           }));
                           let imageDetail={originalname:req.file.originalname, filename:req.file.filename, http_path:fileHostingPath,type:"Document",size:req.file.size,encoding:req.file.encoding};
                           console.log(imageDetail);
                           let result=commonMsg.success_upload;
                           result.results=imageDetail;
                           Ftp.destroy();
                           res.status(200).send(result);
                       }
                   });
               }else {
                   console.log('upload failed');
                   res.status(200).send(commonMsg.upload_failed);
               }
           }
        });
    }catch (err){
        console.log(err)
        res.status(200).send(commonMsg.upload_failed);
    }
});
router.post('/upload/image',function(req,res,next){
    try {
        console.log(req.file);
        uploadImage(req,res,function (err) {
            if(err){
                console.log(err);
                res.status(200).send(commonMsg.upload_failed);
            }
            else {
                if(req.file){
                    let file =path.join(__dirname, '../public/temps/'+req.file.filename);
                    console.log(file);
                    let ftpDestFolderAndFileName="STORAGE/BANWASLU/IMAGES/"+req.file.filename;
                    let fileHostingPath="http://filehosting.pptik.id/"+ftpDestFolderAndFileName;

                    let Ftp = new JSFtp({
                        host:ftp.pptik.host,
                        port: 21,
                        user: ftp.pptik.user,
                        pass: ftp.pptik.pass
                    });
                    Ftp.put(file, ftpDestFolderAndFileName, function(err) {
                        if (err) console.log(err);
                        else {
                            fs.unlink(file,(err => {
                                if(err)console.log(err);
                            }));
                            let imageDetail={originalname:req.file.originalname, filename:req.file.filename, http_path:fileHostingPath,type:"Image",size:req.file.size,encoding:req.file.encoding};
                            console.log(imageDetail);
                            let result=commonMsg.success_upload;
                            result.results=imageDetail;
                            Ftp.destroy();
                            res.status(200).send(result);
                        }
                    });
                }else {
                    console.log('upload failed');
                    res.status(200).send(commonMsg.upload_failed);
                }
            }
        });
    }catch (err){
        console.log(err)
        res.status(200).send(commonMsg.upload_failed);
    }
});
module.exports = router;

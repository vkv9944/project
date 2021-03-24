const express=require('express');

const authController=require('../controllers/auth');


const app= express()



const router =express.Router();

router.post('/register',authController.register)
router.post('/login',authController.login)
router.post('/upload',authController.upload)
router.post('/req_audit',authController.req_audit)

router.post('/alogin',authController.alogin)
router.post('/req_hash',authController.req_hash)




module.exports=router;
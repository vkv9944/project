const express=require('express');

const router =express.Router();

const authController=require('../controllers/auth');

router.get('/',(req,res)=>{
    res.render('index');
})

router.get('/register',(req,res)=> {
    res.render('register');
})

router.get('/login',(req,res)=> {

    res.render('login');
})

router.get('/about',(req,res)=> {
    res.render('about');
})

router.get('/logout',(req,res)=> {

    req.session.destroy(function(error){ 
        console.log("Session Destroyed") 
        res.render('login');
    }) 

    
})

router.get('/view_file',authController.view_file)


module.exports=router;
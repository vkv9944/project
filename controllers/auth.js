const mysql=require('mysql');

const jwt =require('jsonwebtoken');
const bcrypt=require('bcryptjs');

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const { request } = require("express");

exports.register=(req,res)=>{

    console.log(req.body);

//const name=request.body.name;
//const email=request.body.email;
//const password=request.body.password;
//const passwordConfirm=req.body.passwordConfirm;

//we can use above code in simple as bellow

const {name, email,password,passwordConfirm}=req.body;


db.query('SELECT email from users WHERE email = ?',[email],async (error,results)=>{
    if(error){
        console.log(error);
    }
    if(results.length > 0) {
        return res.render('register',{
            message:'this email already exist'
           });
    }  else if( password !== passwordConfirm){
        return res.render('register',{
            message:'password not matched'
           });
    }

   

  let hashedPassword= await bcrypt.hash(password, 8);
  console.log(hashedPassword);
  
  db.query('INSERT INTO users SET ?',{name: name,email:email, password:hashedPassword},(error, results)=>{

    if(error){
        console.log(error);
    }else{
        console.log(results);
        return res.render('register',{
         message:'user registered'
        });
    }

  })

})


  //  res.send("form submitted");
}



exports.login = async (req, res) => {

    try {
    const {email, password}=req.body;
    
    if(!email || !password){
        
        return res.render('login',{
            message:'please provide valid email and password'
        })
    }

    db.query('SELECT *FROM users WHERE email=?',[email], async(error,results)=>{
        console.log(results);
        if(!results || !(await bcrypt.compare(password,results[0].password))){
          
         res.status(401).render('login',{
             message:'Email or password is incorrect'
         })
        }else{
            //res.send("form submitted");
            res.render('user');


        }
     })


    


      
    } catch (error) {
        console.log(error);
        
    }
    
        
    }


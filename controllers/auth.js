const mysql=require('mysql');
const express=require("express");
const jwt =require('jsonwebtoken');
const bcrypt=require('bcryptjs');

const upload =require('express-fileupload');



//const app=express();
//app.use(upload())

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

//var userid='null';

const { request } = require("express");
const e = require('express');

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

    req.session.name = 'user_login'

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
            req.session.uid = email;
            //userid=email;
            res.render('user',{
                user:email,
                message:'successfull login'
            });


        }
     })


    


      
    } catch (error) {
        console.log(error);
        
    }
    
        
    }




    //uploads

    exports.upload = (req, res) => {

        var usr=req.session.uid;
        if(req.files){


            console.log(req.files)
            var file =req.files.file
            var filename=file.name
            console.log(filename)
            console.log("hash value:"+file.md5)


//date
var d = new Date();

var tm=""+d.getHours()+":"+d.getMinutes()+"."+d.getSeconds();
var tdate="_"+d.getDate()+"."+d.getMonth()+"."+d.getFullYear();
var fnm=tdate+","+tm+"";


      
            var fname=filename+"_"+d.getSeconds();
      
            db.query('SELECT fhash from fdb WHERE  user=? AND fhash = ? ',[usr,file.md5],async (error,results)=>{

                if(error){
                    console.log(error);
                }
                if(results.length > 0) {
                    return res.render('user',{
                        message:'File already exist'
                       });
                }  else{
                    
                 //   var fname=filename+"_("+tdate+")";

                    file.mv('./public/uploads/'+ fname,function(err){
                        if(err){
                            res.send(err)
                        }else{
                          //  res.send("file uploaded"+"__"+file.md5);

                   
                             var uid=req.session.uid;
                          db.query('INSERT INTO fdb SET ?',{user:uid,fname:fname, fhash:file.md5},(error, results)=>{

                            if(error){
                                console.log(error);
                            }else{
                                return res.render('user',{
                                    user:uid,
                                    message:"file uploaded"+"__"+fname+"_hash:"+file.md5
                                  })
                            }
                        
                          })

                             }
                        
                    })


                }

            })

    
          
         
      
        }


    }


    exports.view_file= (req,res)=>{

        var uid=req.session.uid;


       db.query('SELECT * from fdb WHERE user = ?',[uid],async (error,results)=>{

        if(error){
            console.log(error);
        }else{
            if(results.length > 0) {
               
                res.render('file_view',{ title:'files_list',files:results})

            }  else{
                res.render('file_view',{ title:'No file uploaded',files:results})
            }

          
        }


       })


    }
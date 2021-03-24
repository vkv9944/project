const mysql=require('mysql');
const express=require("express");
const jwt =require('jsonwebtoken');
const bcrypt=require('bcryptjs');
var JSAlert = require("js-alert");

var fs = require('fs');
var crypto = require('crypto');
//var hash = require('object-hash');
var md5 = require('md5');

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

var upload_files;
var audit_request;
var f;

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


// user login
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
var tdate=""+d.getDate()+"."+d.getMonth()+"."+d.getFullYear();



      
            var fname=d.getSeconds()+"_"+filename;
            
      
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
                          db.query('INSERT INTO fdb SET ?',{user:uid,fname:fname, fhash:file.md5,date:tdate},(error, results)=>{

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

// view file
    exports.view_file= (req,res)=>{

        var uid=req.session.uid;


       db.query('SELECT * from fdb WHERE user = ?',[uid],async (error,results)=>{

        if(error){
            console.log(error);
        }else{
            if(results.length > 0) {
                upload_files=results;
                res.render('file_view',{ title:'files_list',files:results})

            }  else{
                res.render('file_view',{ title:'No file uploaded',files:results})
            } 
        }
       })


    }

    /// auditing pending request

    exports.req_audit=(req,res)=>{

        var uid=req.session.uid;
        const file_name=req.body.file_name;
   

        var d = new Date();
        var tdate=""+d.getDate()+"."+d.getMonth()+"."+d.getFullYear();
       
        

        db.query('INSERT INTO audit_request SET ?',{user:uid,fname:file_name, status:'requested',date:tdate},(error, results)=>{

            if(error){
                console.log(error);
            }else{
  
                return res.render('file_view',{
                    user:uid,
                    message:"request send for audit",
                    files:upload_files
                  })
              
            }
        
          })

    }


    // auditor login

    exports.alogin = async (req, res) => {

        req.session.name = 'auditor_login'
       
    
        try {
        const {userid, password}=req.body;
        req.session.a_uid = userid;
        if(!userid || !password){
            
            return res.render('auditor_login',{
                message:'please provide valid userid and password'
            })
        }
    
        db.query('SELECT *FROM auditor WHERE userid=?',[userid], async(error,results)=>{
            console.log(results);
            if(!results || !(password==results[0].password)){
              
             res.status(401).render('auditor_login',{
                 message:'userid or password is incorrect'
             })
            }else{
             
                db.query('SELECT * from audit_request WHERE status = ?',['requested'],async (error,results)=>{

                    if(error){
                        console.log(error);
                    }else{
                        if(results.length > 0) {
                            audit_request=results;
                            res.render('auditor_page',{ title:'audit_list', user:userid,files:results})
            
                        }  else{
                            res.render('auditor_page',{ title:'No pending request', user:userid,files:results})
                        } 
                    }
                   })
    
                }
              })
    
       
         } catch (error) {
            console.log(error);
            
        }
        
            
        }




    /// request hash to csp

     exports.req_hash= async(req,res)=>{

            var fname=req.body.file_name;

            var fpath="./public/uploads/"+fname;
            console.log(fpath);

            var fhash;
            var fhash_db;
            var result;


fs.readFile(fpath, function(err, buf) {
    
    //fhash=md5(buf);
    console.log(fhash=md5(buf));
  });


  db.query('SELECT fhash from fdb WHERE fname = ?',[fname],async (error,results)=>{

    if(error){
        console.log(error);
    }else{
        if(results.length > 0) {
            fhash_db=results[0].fhash;
            
            if(fhash==fhash_db)
            {
                result='auditing done(data safe(not changed))';
            }
            else{
                result='auditing done(data unsafe(tempered))';
            }


           
            db.query('UPDATE audit_request SET status="done" WHERE fname = ?',[fname],async (error,results)=>{

                if(error){
                    console.log(error);
                }else{
                     console.log("auditing updated");
                     res.render('auditing',{ title:'audit_result', fhash:fhash,fhash_db:fhash_db,result:result})
                }
               })
        
           


        }  else{
            res.render('auditing',{ title:'No pending request', fhash:'0x',fhash_db:'0x'})
        } 
    }
   })

 }


 //audit request all
 exports.audit_list=(req,res)=>{

    db.query('SELECT * from audit_request ',[],async (error,results)=>{

        if(error){
            console.log(error);
        }else{
            if(results.length > 0) {
                audit_request=results;
                res.render('audit_list',{ title:'audit_list', user:req.session.a_uid,files:results})

            }  else{
                res.render('audit_list',{ title:'No request', user:req.session.a_uid,files:results})
            } 
        }
       })



 }






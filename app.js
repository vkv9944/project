const express=require("express");
const mysql=require("mysql");
const dotenv=require('dotenv');
const path=require('path');
const upload =require('express-fileupload')
const session = require('express-session') 

dotenv.config({ path: './.env'});   

const app=express();
app.use(upload())

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const publicDirectory= path.join(__dirname,'./public');
//console.log(__dirname);


//Parse URL-encoded bodies (as sent by html forms)
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.use(express.static(publicDirectory));

app.set('view engine','hbs');


app.use(session({ 
  
    // It holds the secret key for session 
    secret: 'vivek12345', 
  
    // Forces the session to be saved 
    // back to the session store 
    resave: true, 
  
    // Forces a session that is "uninitialized" 
    // to be saved to the store 
    saveUninitialized: true
})) 





db.connect( (error) =>{
 if(error){
     console.log(error);

 }
 else{
     console.log("MySql connected");
 }

})

/*
//DEFine rotes previous
app.get("/",(req,res)=>{
    //res.send("<h1>Home page</h1>")
    res.render("index")
});


app.get("/register",(req,res)=>{
    //res.send("<h1>Home page</h1>")
    res.render("register")
}); */


//Define routes

app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));



app.listen(5006,()=>{
    console.log("server started on 5006");
})
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session');
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "static")))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'static/views'))
app.use(session({
    secret: 'abcdsecretkey', 
    resave: false,
    saveUninitialized: false
  }));

app.use('/', require(path.join(__dirname,'routes/login.js')))

app.listen(port, ()=>{
    console.log(`Server running on port : ${port}`)
})


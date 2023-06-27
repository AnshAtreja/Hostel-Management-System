const express = require('express')
const mongoose = require('mongoose');
const path = require('path')
const bodyParser = require('body-parser')
const router = express.Router()
const Warden = require('./wardens')
const hosteller = require('./hostellers')
// const Student = require('./student')
const Rooms = require('./rooms')

mongoose.connect('mongodb://127.0.0.1:27017/hostel_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => {
  console.log(err);
});
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
  console.log("Login Page")
  res.render('login')
})

router.get('/wr_lgn', (req, res) => {
  console.log("Warden Login Page")
  res.render('warden-login', {error: ''})
})

router.get('/hs_lgn', (req, res) => {
  console.log("Hosteller Login Page")
  res.render('hosteller-login',{error: ''})
})

router.get('/w-dashboard', (req, res)=>{
  const warden = req.session.warden;
  res.render('warden-dashboard', {warden})
})

router.get('/h-dashboard', (req, res)=>{
  const hosteller = req.session.hosteller;
  res.render('hosteller-dashboard', {hosteller})
})


router.post('/w-dashboard', async (req, res) => {
  console.log("Login try from warden")
  const { username, password } = req.body

  try {
    const warden = await Warden.findOne({ username });

    if (!warden || warden.password !== password) {
      res.render('warden-login', {error: 'Incorrect Username or Password'})
    }
    req.session.warden = warden
    res.render('warden-dashboard', {warden})
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error')
  }
})

router.post('/h-dashboard', async (req, res) => {
  console.log("Login try from hosteller")
  const { username, password } = req.body

  try {
    const user = await hosteller.findOne({ username });

    if (!user || user.password !== password) {
      res.render('hosteller-login', {error: 'Incorrect Username or Password'})
    }
    req.session.hosteller = hosteller
    res.render('hosteller-dashboard', {hosteller})
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
})

router.get('/add-student', (req, res) => {
  console.log("Adding Student Page")
  res.render('add-student', { msg: '', error: '' })
})

router.get('/add-room', (req, res) => {
  console.log("Adding Room Page")
  res.render('add-room', { msg: '', error: '' })
})

router.get('/wr-logout', (req,res)=>{
  console.log("Get req")
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.render('warden-login', {error: 'Logged Out'})
  })
})

router.post('/add-student', async (req, res) => {
  console.log("Adding Student")
  try {
    const { name, roll_no, branch, room_no, username, password } = req.body;
    const room = await Rooms.findOne({ room_no });
    if (!room) {
      res.render('add-student', { msg: '', error: 'Room does not exist' })
    }

    room.alloted += 1;

    if(room.alloted > room.capacity){
      room.alloted -= 1
      res.render('add-student', { msg: '', error: 'Room Full' })
    }
    await room.save();

    const hostel = new hosteller({
      username,
      password,
      name,
      roll_no,
      branch,
      room_no
    });

    await hostel.save();
    console.log("Student added")
    res.render('add-student', { msg: 'Student added successfully', error: '' });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      room.alloted -= 1
      room.save()
      res.render('add-student', { msg: '', error: 'Username or Roll number already exists' });
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
})

router.post('/add-room', async (req,res)=>{
  try{
  console.log("Adding room")
  const { room_no, capacity} = req.body

  const room = new Rooms({
    room_no,
    capacity
  })

  await room.save()
  res.render('add-room',{msg: 'Room added successfully', error: ''})
}
catch(error){
  console.error(error);
    if (error.code === 11000) {
      res.render('add-room', { msg: '', error: 'Room Already exists' });
    } else {
      res.status(500).send('Internal Server Error');
    }
}

})

router.get('/check-details', async (req,res)=>{
  res.render('check-details', {error: ''})
})

router.post('/check-details', async (req,res)=>{
  try{
    const {roll_num} = req.body
    const student = await hosteller.findOne({ roll_no: roll_num });
    if (!student) {
      res.render('check-details', {error: "Student not found"})
    }
    res.render('student-details', { student });

  }catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error')
  }

})


module.exports = router
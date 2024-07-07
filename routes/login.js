const express = require('express')
const mongoose = require('mongoose');
const path = require('path')
const bodyParser = require('body-parser')
const router = express.Router()
const Warden = require('./wardens')
const Hosteller = require('./hostellers')
// const Student = require('./student')
const Rooms = require('./rooms')
const Chng = require('./room-chng-req')

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
  res.render('warden-login', { error: '' })
})

router.get('/hs_lgn', (req, res) => {
  console.log("Hosteller Login Page")
  res.render('hosteller-login', { error: '' })
})

router.get('/w-dashboard', (req, res) => {
  const warden = req.session.warden;
  res.render('warden-dashboard', { warden })
})

router.get('/h-dashboard', (req, res) => {
  const hosteller = req.session.hosteller;
  res.render('hosteller-dashboard', { hosteller })
})


router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/w-dashboard', async (req, res) => {
  console.log("Login try from warden")
  const { username, password } = req.body

  try {
    const warden = await Warden.findOne({ username });

    if (!warden || warden.password !== password) {
      res.render('warden-login', { error: 'Incorrect Username or Password' })
    }
    else {
      req.session.warden = warden
      res.render('warden-dashboard', { warden })
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error')
  }
})

router.post('/h-dashboard', async (req, res) => {
  console.log("Login try from hosteller")
  const { username, password } = req.body

  try {
    const hosteller = await Hosteller.findOne({ username });

    if (!hosteller || hosteller.password !== password) {
      res.render('hosteller-login', { error: 'Incorrect Username or Password' })
    }
    else {
      req.session.hosteller = hosteller._id
      res.render('hosteller-dashboard', { hosteller })
    }
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

router.get('/change-room', (req, res) => {
  res.render('chng-room', { error: '', msg: '' })
})

router.post('/chng-room', async (req, res) => {
  try {
    const { prev_room, new_room } = req.body
    const hostellerId = req.session.hosteller;
    const hostellerr = await Hosteller.findById(hostellerId);

    const host = hostellerr.name
    const previousRoom = await Rooms.findOne({ room_no: prev_room });
    const newRoom = await Rooms.findOne({ room_no: new_room });
    if (!previousRoom) {
      res.render('chng-room', { error: 'Previous Room does not exist', msg: '' })
    }
    else if (!newRoom) {
      res.render('chng-room', { error: 'New Room does not exist', msg: '' })
    }
    else if (newRoom.capacity === newRoom.alloted) {
      res.render('chng-room', { error: 'New Room capacity full', msg: '' })
    }
    else {
      const chng = new Chng({
        host,
        prev_room,
        new_room
      })

      await chng.save();
      res.render('chng-room', { error: '', msg: 'Request sent Successfully' })
    }
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Failed to submit room change request' });
  }
})

router.get('/hm-pass', (req, res) => {
  res.render('home-pass', { error: '', msg: '' })
})

router.get('/hm-apply', async (req, res) => {
  try {
    const hostellerId = req.session.hosteller;
    const hosteller = await Hosteller.findById(hostellerId);
    if (hosteller.hm_apply) {
      return res.render('home-pass', { error: 'Home Pass already applied', msg:'' });
    }
    await Hosteller.updateOne({ _id: hostellerId }, { $set: { hm_apply: true } });
    return res.render('home-pass',{msg:'Application Sent', error:''})
  }
  catch (error) {
    console.log(error)
    res.status(500).send('An error occurred');
  }
})

router.get('/hm-cancel', async (req, res) => {
  try {
    const hostellerId = req.session.hosteller;
    const hosteller = await Hosteller.findById(hostellerId);
    // if (!hosteller.hm_apprv) {
    //   return res.render('home-pass', { error: 'Home Pass not approved yet', msg:'' });
    // }
    if (!hosteller.hm_apply) {
      return res.render('home-pass', { error: 'Home Pass not applied yet', msg:'' });
    }
    await Hosteller.updateOne({ _id: hostellerId }, { $set: { hm_apply: false } });
    return res.render('home-pass',{msg:'Home Pass cancelled', error:''})
  }
  catch (error) {
    console.log(error)
    res.status(500).send('An error occurred');
  }
})

router.get('/hm-apprv', async (req,res)=>{
  const hostellerId = req.session.hosteller;
    const hosteller = await Hosteller.findById(hostellerId);
    if(hosteller.hm_apprv){
      return res.render('home-pass',{msg:'Home Pass Approved', error:''})
    }
    else{
      return res.render('home-pass',{msg:'', error:'Home Pass not approved'})
    }
})

router.post('/add-student', async (req, res) => {
  console.log("Adding Student");
  let room; // Declare room outside the try block

  try {
    const { name, roll_no, branch, room_no, username, password } = req.body;
    room = await Rooms.findOne({ room_no });

    if (!room) {
      return res.render('add-student', { msg: '', error: 'Room does not exist' });
    }

    room.alloted += 1;

    if (room.alloted > room.capacity) {
      room.alloted -= 1;
      return res.render('add-student', { msg: '', error: 'Room Full' });
    }

    await room.save();

    const hosteller = new Hosteller({
      username,
      password,
      name,
      roll_no,
      branch,
      room_no
    });

    await hosteller.save();
    console.log("Hosteller added");
    return res.render('add-student', { msg: 'Student added successfully', error: '' });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      // Duplicate key error (unique constraint violation)
      if (room) {
        room.alloted -= 1;
        await room.save();
      }
      return res.render('add-student', { msg: '', error: 'Username or Roll number already exists' });
    } else {
      // Other errors
      return res.status(500).send('Internal Server Error');
    }
  }
});

router.post('/add-room', async (req, res) => {
  try {
    console.log("Adding room")
    const { room_no, capacity } = req.body

    const room = new Rooms({
      room_no,
      capacity
    })

    await room.save()
    res.render('add-room', { msg: 'Room added successfully', error: '' })
  }
  catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.render('add-room', { msg: '', error: 'Room Already exists' });
    } else {
      res.status(500).send('Internal Server Error');
    }
  }

})

router.get('/check-details', async (req, res) => {
  res.render('check-details', { error: '' })
})

router.post('/check-details', async (req, res) => {
  try {
    const { roll_num } = req.body
    const student = await Hosteller.findOne({ roll_no: roll_num });
    if (!student) {
      res.render('check-details', { error: "Student not found" })
    }
    res.render('student-details', { student });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error')
  }

})

// router.get('/hm-pass', (req,res)=>{

// })

router.get('/apprv-pass', async (req, res) => {
  try {
    const hostellers = await Hosteller.find({ hm_apply: true }).exec();
    res.render('hm-req', { hostellers });
  } catch (err) {
    // Handle the error, e.g., render an error page or show an error message
    res.render('error', { message: 'Error retrieving home pass requests' });
  }
});

router.post('/apprv-pass', async (req, res) => {
  console.log("post request")
  const  {hostellerId}  = req.body
  console.log(hostellerId)

  Hosteller.findByIdAndUpdate(hostellerId, { hm_apprv: true, hm_apply: false })
    .then( async () => {
      console.log("updated")
      const hostellers = await Hosteller.find({ hm_apply: true }).exec();
      res.render('hm-req', {hostellers});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the hosteller' });
    });
});

router.post('/apprv-chng', async (req, res) => {
  console.log("post request")
  const  {hostellerId, prev_room, new_room}  = req.body
  console.log(hostellerId)

  Hosteller.findByIdAndUpdate(hostellerId, { hm_apprv: true, hm_apply: false })
    .then( async () => {
      console.log("updated")
      const hostellers = await Hosteller.find({ hm_apply: true }).exec();
      res.render('hm-req', {hostellers});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the hosteller' });
    });
});

router.get('/wr-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.render('warden-login', { error: 'Logged Out' })
  })
})

router.get('/hs-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.render('hosteller-login', { error: 'Logged Out' })
  })
})

module.exports = router
// SETUP EXPRESS
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = mongodb.MongoClient;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const jwtSecret = 'mysecretkey';
dotenv.config();

let app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// connect to the Mongo DB
async function connect() {
  const mongo_url = process.env.MONGO_URI;
  console.log(mongo_url);
  let client = await MongoClient.connect(mongo_url, {
    "useUnifiedTopology": true
  })
  let db = client.db("test_stationery");
  console.log("database connected");
  return db;
}


// generate salt and hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// compare password with hash
async function comparePassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}


// ROUTES

async function main() {
  let db = await connect();

  app.get('/test_stationery', async (req, res) => {
    let items = await db.collection('items').find().toArray();
    res.json(items)

  })

  app.get('/test_stationery/:itemId', async (req, res) => {
    let r = await db.collection('items').findOne({
      _id: new ObjectId(req.params.itemId)
    });
    res.json(r);
  })

  app.post('/test_stationery', async (req, res) => {
    let results = await db.collection('items').insertOne({
      productName: req.body.productName,
      productType: req.body.productType,
      brand: req.body.brand,
      availableColor: req.body.availableColor,
      reviews: req.body.reviews,

      image: req.body.image,
      specification: {
        pointSize: req.body.pointSize,
        inkColor: req.body.inkColor,
        inkType: req.body.inkType,
        waterProof: req.body.waterProof
      }
    })
    res.json(results);

  })

  app.patch('/test_stationery/:id/reviews', async (req, res) => {
    let results = await db.collection('items').updateOne({
      '_id': new ObjectId(req.params.id),
    }, {
      '$set': {
        'reviews': req.body.reviews
      }
    })
    res.json({
      'status': true
    })
  })


  app.patch('/test_stationery/:id', async (req, res) => {
    let results = await db.collection('items').updateOne({
      '_id': new ObjectId(req.params.id),
    }, {
      '$set': {
        'productName': req.body.productName,
        'productType': req.body.productType,
        'brand': req.body.brand,
        'availableColor': req.body.availableColor,
        'reviews': req.body.reviews,
        'image': req.body.image,

        'specification.pointSize': req.body.pointSize,
        'specification.inkColor': req.body.inkColor,
        'specification.inkType': req.body.inkType,
        'specification.waterProof': req.body.waterProof

      }
    })
    res.json({
      'status': true
    })
  })

  app.delete('/test_stationery/:id', async (req, res) => {
    let results = await db.collection('items').deleteOne({
      _id: new ObjectId(req.params.id)
    })
    res.json({
      'message': 'Success'
    })
  })


  // User Authentication
  // app.post('/test_stationery/register', async (req, res) => {
  //   const { username, password } = req.body;

  //   const existingUser = await db.collection('users').findOne({ username: username });
  //   if (existingUser) {
  //     return res.status(400).json({ message: 'User already exists' });
  //   }

  //   // hash password
  //   const hashedPassword = await hashPassword(password);

  //   // create new user
  //   const newUser = {
  //     username: username,
  //     password: hashedPassword
  //   };

  //   // insert new user to database
  //   await db.collection('users').insertOne(newUser);

  //   res.json({ message: 'User created successfully' });

  // });




  // testing of user authentication end here

}

//Working Express

main();

// START SERVER
// note: we set port to 8888 so it won't clash with React
app.listen(8889, () => {
  console.log("server has started")
}) 
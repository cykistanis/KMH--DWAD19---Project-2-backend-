// SETUP EXPRESS
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = mongodb.MongoClient;
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config();

let app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));






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

// User schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// User model
const User = mongoose.model('User', UserSchema);



// ROUTES

async function main() {
  let db = await connect();



  // user authentication start here

  app.post('/test_stationery/login', async (req, res) => {
    const { username, password } = req.body;

    let usersdetails = await db.collection('users').findOne({ username, password }, (err, user) => {
      console.log(err, user)
      if (err) {
        console.log(err);
        return res.status(500).send();
      }

      if (!user) {
        return res.status(401).send();
      }

      return res.status(200).send();
    });
  });

  // user authentication end here

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

  // app.patch('/test_stationery/:id/reviews', async (req, res) => {
  //   let results = await db.collection('items').updateOne({
  //     '_id': new ObjectId(req.params.id),
  //   }, {
  //     '$set': {
  //       'reviews': req.body.reviews
  //     }
  //   })
  //   res.json({
  //     'status': true
  //   })
  // })

  app.patch('/test_stationery/:id/reviews', async (req, res) => {
    let results = await db.collection('items').updateOne({
      '_id': new ObjectId(req.params.id),
    }, {
      '$push': {
        'reviews': { '$each': req.body.reviews }
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


}

//Working Express

main();

// START SERVER
// note: we set port to 8888 so it won't clash with React
app.listen(8889, () => {
  console.log("server has started")
}) 
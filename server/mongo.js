// require('dotenv').config()
import 'dotenv/config';
// const { MongoClient, ServerApiVersion } = require('mongodb');
import { MongoClient, ServerApiVersion } from 'mongodb';
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const uri = process.env.MONGO_URI;

app.use(express.static(join(__dirname, '../public')));
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const db = client.db('hotel');
const collection = db.collection('games');


const seedData = [
  { title: 'Halo 3', platform: 'Xbox 360', genre: 'FPS', rating: 9.5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShh_jyuI7EXWuqrKOTeEE0NWupL5W9Tav6srKezP5MLA&s=10' },
  { title: 'Persona 5 royale', platform: 'PlayStation 5', genre: 'RPG', rating: 10.0, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1N_SM_4UwoKl73gDMvFChcnrxh5EifcgGxe-96r7k8w&s=10'},
  { title: 'Mario Odyssey', platform: 'Nintendo Switch', genre: 'Platformer', rating: 9.0, image: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/store/software/switch/70010000001130/c42553b4fd0312c31e70ec7468c6c9bccd739f340152925b9600631f2d29f8b5' }
];


// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public', 'hotel.html'));
})



app.get('/api/hello', function (req, res) {

  // const message = 'hello from the server as a variable';
  // res.send(message);

  const message = {
    message: 'hello from hard code json',
    success: 'true'
  };
  res.json(message);


}
);

//iss08, get all items. 
//iss10 in here also, refactored this endpoint for all or filtered itemss
app.get('/api/games', async function (req, res) {

  //iss10 stuff
  
  const platform = req.query.platform;

  // console.log('iss10 platform.', platform);

  const filter =
    platform
      ? {
        platform: platform 
      }
      : {};
  //end iss10 new stuff

  const records =
    await collection
      // .find({}) remove for iss10
      .find(filter) //add for iss10
      .toArray();

  res.json(records);

}
);

//iss09. get one
app.get('/api/games/:id', async function (req, res) {

  const id =
    new ObjectId(
      req.params.id
    );

  const record =
    await collection
      .findOne({
        _id: id
      });

  res.json(record);

}
);

//iss 11, notice post to slash api/games != get to slash of same name
app.post('/api/games', async function(req, res) {
    const newItem = req.body;
    const result = await collection.insertOne(newItem);
    res.status(201).json(result);
});

app.post('/api/students', function (req, res) {
  console.log(req.body);

  res.json({
    received:
      req.body
  });
}
);

//iss07 seed & clear 
app.post('/api/dev/seed', async function (req, res) {
  const result =
    await collection
      .insertMany(
        seedData
      );
  res.json(result);
}
);
//clear it all 
app.delete('/api/dev/clear', async function (req, res) {
  const result =
    await collection
      .deleteMany({});
  res.json(result);
}
);


//iss12 
app.patch('/api/games/:id',
  async function(req, res) {
    const id = new ObjectId(req.params.id);
    const changes = req.body;
    const result = await collection
        .updateOne({ _id: id }, { $set: changes });
    res.json(result);
});

//iss20
app.delete('/api/games/:id',
  async function(req, res) {
    const id = new ObjectId(req.params.id);
    const result = await collection.deleteOne({ _id: id });
    res.json(result);
});

//iss15...
app.post('/api/create-account', async function(req,res) {

const passwordHash = await bcrypt.hash(req.body.password, 10);

const result = await db.collection('users').insertOne({
  username: req.body.username,
  email: req.body.email,
  passwordHash: passwordHash,
  role: 'user'
});

res.json(result); 

}); 

//start up server


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
}); 

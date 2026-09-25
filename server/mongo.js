// require('dotenv').config()
import 'dotenv/config';
// const { MongoClient, ServerApiVersion } = require('mongodb');
import { MongoClient, ServerApiVersion } from 'mongodb';
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
const collection = db.collection('items');

const seedData = [
  { name: 'alpha', category: 'one' },
  { name: 'bravo', category: 'two' },
  { name: 'charlie', category: 'one'}
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

//start POST endpoints
app.post('/api/students', function (req, res) {
  console.log(req.body);

  res.json({
    received:
      req.body
  });
}
);

app.post('/api/dev/seed', async function(req, res) {
    const result =
      await collection
        .insertMany(
          seedData
        );
    res.json(result);
  }
);

app.delete( '/api/dev/clear', async function(req, res) {

    const result =
      await collection
        .deleteMany({});

    res.json(result);

  }
);
//start up server

app.listen(5500, () => {
  console.log('Server is running on http://localhost:5500')
})
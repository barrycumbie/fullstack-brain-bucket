import 'dotenv/config';
import express from 'express'
import { MongoClient, ServerApiVersion } from 'mongodb';
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
const db = client.db('game');
const collection = db.collection('scores');


// const seedData = [
//   { name: 'jo0e', score: 20 },
//   { name: 'bravo', score: 2 },
//   { name: 'charlie', score: 4 }
// ];

// const result =
//     await collection
//       .insertMany(
//         seedData
//       );
//  console.log(result); 



// here is a change 

app.use(express.static(join(__dirname, '../public')));

// app.get('/', (req, res) => {
//   res.send('Hello World')
// })

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
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

app.get('/api/scores', async function(req, res) {

    const scores =
      await collection
        .find({})
        .toArray();

    console.log(scores);     
    res.json(scores);

  }
)

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
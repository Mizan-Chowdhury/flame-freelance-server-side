const express = require("express");
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.qzinma9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    app.post('/addJob', async (req,res)=>{
        const newJob = req.body;
        
    })




    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  catch(err){
    console.log(err.message);
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




// server work testing
app.get("/", (req, res) => {
  res.send("server is running on UI");
});
app.listen(port, (req, res) => {
    console.log('server is running on port: ',port);
});

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParsar = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assigments-de09b.web.app",
      "https://assigments-de09b.firebaseapp.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.use(express.json());
app.use(cookieParsar());

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ error: "unAuthorized" });
  }
  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: "unAuthorized" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.qzinma9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const addNewJob = client.db("flameFrelanceDB").collection("addJob");
    const addBiddedJob = client.db("flameFrelanceDB").collection("biddedJob");
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: "200h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({success: true});
    });


    app.post('/logout', (req, res)=>{
      const user = req.body
      res.clearCookie('token',{maxAge:0}).send({success:true})
    })

    app.post("/addJob", async (req, res) => {
      const newJob = req.body;
      const result = await addNewJob.insertOne(newJob);
      res.send(result);
    });

    app.get("/allJob/:category", async (req, res) => {
      const category = req.params.category;
      console.log(category);
      const query = { category: category };
      const result = await addNewJob.find(query).toArray();
      res.send(result);
    });

    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addNewJob.findOne(query);
      res.send(result);
    });

    app.get("/postedJobs/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      const owner = req.user.email;
      console.log(email, owner);
      if(email !== owner){
        return res.status(403).send({message: "forbidden access"})
      }
      console.log(email);
      const query = { email: email };
      const result = await addNewJob.find(query).toArray();
      res.send(result);
    });

    app.get("/updatePostedJobs/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await addNewJob.findOne(query);
      res.send(result);
    });

    app.put("/updatePostedJobs/:id", async (req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;
      const email = req.body.email;
      console.log(updatedJob, id);
      const filter = {
        _id: new ObjectId(id),
        email: email,
      };
      const option = { upsert: true };
      const updatedProduct = {
        $set: {
          title: updatedJob.title,
          deadline: updatedJob.deadline,
          category: updatedJob.category,
          min_price: updatedJob.min_price,
          max_price: updatedJob.max_price,
          description: updatedJob.description,
        },
      };
      const result = await addNewJob.updateOne(filter, updatedProduct, option);
      res.send(result);
    });

    app.delete("/deleted/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await addNewJob.deleteOne(query);
      res.send(result);
    });

    app.patch("/postedJobs/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      console.log(id, status.status);
      const query = {
        _id: new ObjectId(id),
      };
      const updataStatus = {
        $set: {
          status: status.status,
        },
      };
      const result = await addBiddedJob.updateOne(query, updataStatus);
      res.send(result);
    });

    app.post("/biddedJob", async (req, res) => {
      const biddedJob = req.body;
      console.log(biddedJob);
      const result = await addBiddedJob.insertOne(biddedJob);
      res.send(result);
    });

    app.patch("/biddedJob/id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await addBiddedJob.updateOne();
      res.send(result);
    });


    app.get("/biddedJob",verifyToken, async (req, res) => {
      const email = req.query.email;
      const owner = req.user.email;
      console.log('user', email);
      console.log('owner', owner);
      if(email !== owner){
        return res.status(403).send({message: "forbidden access"})
      }

      const asn = req.query.status
      const filter = {}
      if(asn){
        filter.status = asn
      }
      console.log(filter)
      const query = { userEmail: email };
      const result = await addBiddedJob.find(query).sort(filter).toArray();
      res.send(result);
    });

    app.get("/biddJobRequests/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      const owner = req.user.email;
      console.log('user', email);
      console.log('owner', owner);
      if(email !== owner){
        return res.status(403).send({message: "forbidden access"})
      }
      console.log(email);
      const query = { employerEmail: email };
      const result = await addBiddedJob.find(query).toArray();
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
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
  console.log("server is running on port: ", port);
});

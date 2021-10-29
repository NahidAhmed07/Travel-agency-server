const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4v0cg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travesia_travel");
    const specialitiesCollection = database.collection("specialities");
    const servicesCollection = database.collection("services");

    // get all specialties api
    app.get("/specialties", async (req, res) => {
      const result = await specialitiesCollection.find({}).toArray();
      res.send(result);
    });

    // get all servises api
    app.get("/services", async (req, res) => {
      const category = req.query.categories;
      const query = { categories: category };
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment Server Running");
});

app.listen(port, () => {
  console.log("volunteer server running on port", port);
});

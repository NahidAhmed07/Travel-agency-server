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
    const orderCollection = database.collection("orders_collection");
    const postCollection = database.collection("foot_images");

    // get all specialties api
    app.get("/specialties", async (req, res) => {
      const result = await specialitiesCollection.find({}).toArray();
      res.send(result);
    });

    // get all services api
    app.get("/services", async (req, res) => {
      const category = req.query.categories;
      const query = { categories: category };
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    // add a new services api
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    // get single service information
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    // place order api
    app.post("/place_order", async (req, res) => {
      const newOrder = req.body;
      const uId = req.body.userId; // uId = userId
      const sId = req.body.serviceId; // sId = serviceId
      const query = { userId: uId, serviceId: sId };
      const findItem = await orderCollection.find(query).toArray();
      let result;
      if (findItem.length === 0) {
        result = await orderCollection.insertOne(newOrder);
      } else {
        result = { serviceAdded: true };
      }
      res.json(result);
    });

    // get my orders api
    app.get("/my_order/:uid", async (req, res) => {
      const uid = req.params.uid; // uid = userId
      const query = { userId: uid };
      console.log("api hitting");
      // filter user all added service id
      const myOrders = await orderCollection.find(query).toArray();
      if (myOrders.length > 0) {
        const servicesId = [];
        myOrders.forEach((order) => servicesId.push(order.serviceId));
        // filter user added services from all services using service id
        const serviceQuery = { serviceId: { $in: servicesId } };
        const myServices = await servicesCollection
          .find(serviceQuery)
          .toArray();

        // added service register date and service date
        myServices.forEach((service, index) => {
          service.registerDate = myOrders[index].registerDate;
          service.data = myOrders[index].date;
          service.status = myOrders[index].status;
        });
        res.send(myServices);
      } else {
        res.json({ orderNotFound: true });
      }
    });

    // cancel order api
    app.delete("/my_order/:sid/:uid", async (req, res) => {
      const uid = req.params.uid; // uid == userId
      const sid = req.params.sid; // sid == serviceId
      const query = { userId: uid, serviceId: sid };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // get all user order api
    app.get("/all_order", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    // update order approved state
    app.put("/my_order/:sid/:uid", async (req, res) => {
      const sid = req.params.sid; // sid == serviceId
      const uid = req.params.uid; //and uid == userId
      const filter = { userId: uid, serviceId: sid };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc, option);
      res.json(result);
    });

    //  get customer review data items
    app.get("/post", async (req, res) => {
      const result = await postCollection.find({}).toArray();
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
  console.log("Assignment Server Running", port);
});

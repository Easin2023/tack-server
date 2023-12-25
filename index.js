const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgwvewl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const TackDataCollection = client
      .db("todotackserver")
      .collection("userTackData");

    app.post("/tackData", async (req, res) => {
      try {
        console.log(req.body);
        const data = req.body;
        const result = await TackDataCollection.insertOne(data);
        res.status(200).send({ message: "Data inserted successfully" });
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send({ error: "An error occurred while processing your request" });
      }
    });
    app.get("/tackData/:email", async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const query = { userData: { $eq: email } }; // Use $eq to match the exact email
        const result = await TackDataCollection.find(query).toArray(); // Convert the cursor to an array
        res.status(200).send(result);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send({ error: "An error occurred while processing your request" });
      }
    });
    app.put("/tackUpdate/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id)
        const update = { $set: { tack: "complete" } };
        

        const result = await TackDataCollection.updateOne({ _id: new ObjectId(id) }, update);

        if (result.modifiedCount > 0) {
          res.status(200).send({ message: "Task updated successfully" });
        } else {
          res.status(404).send({ error: "Task not found" });
        }
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send({ error: "An error occurred while processing your request" });
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running ");
});

app.listen(port, () => {
  console.log(`server is running ${port}`);
});

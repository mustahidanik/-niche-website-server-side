const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require("cors")
require('dotenv').config()
const app = express()
var ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wgu5d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("data base connecred");

        const database = client.db("car-rental");
        const carCollection = database.collection("cars");
        const orderCollection = database.collection("order");
        const userCollection = database.collection("user");
        const reviewCollection = database.collection("review");

        // post 
        app.post("/order", async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })
        // get my order
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log('eeeee', query);
            const cursor = orderCollection.find(query)
            const order = await cursor.toArray();
            res.json(order);
        })

        // delete
        app.delete("/order", async (req, res) => {
            const id = req.query.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })

        // get 
        app.get("/cars", async (req, res) => {
            const limitIs = parseInt(req.query.limit)
            const cursor = carCollection.find({})
            let result
            if (!limitIs) {

                result = await cursor.toArray()
            }
            else {
                result = await cursor.limit(6).toArray()

            }


            res.send(result)
        })

        // get single car 

        app.get("/singleCar", async (req, res) => {
            const id = req?.query?.id
            const query = { _id: ObjectId(id) };
            const result = await carCollection.findOne(query)
            res.send(result)
        });

        // user post
        app.post("/users", async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user);
            res.json(result)
        })

        // adnin
        app.put("/users/admin", async (req, res) => {
            const user = req.body
            console.log(user);
            const filter = { email: user.email }
            const updateDoc = { $set: { role: "admin" } }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const user = await userCollection.findOne(filter)
            // console.log(result);
            let isAdmin = false
            if (user.role === "admin") {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })

        // review
        app.post("/review", async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            console.log(result);
            res.json(result)
        })



    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log("listening at", port)
})
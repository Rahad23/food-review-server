const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.xa1zyf9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const collection = client.db("AllFood").collection("Food");
const collectionOwner = client.db("AllFood").collection("ownerData");
const collectionHowItWork = client.db("AllFood").collection("howItWorks");
const collectionComment = client.db("AllFood").collection("feedback");




const run=()=>{
   try{
    app.post('/food', async(req, res)=>{
         const foodData = req.body;
         const result = await collection.insertOne(foodData);
         res.send(result);
    })
   }
   catch(e){
     res.send(e.message);
   }
}
run(); 
    
// food limit api
app.get('/food', async(req, res)=>{
    try{
        const query = {};
        const cursor = collection.find(query);
        const result = await cursor.limit(3).toArray();
        res.send(result);
    }
    catch(e){

    }
})
// search id get product
app.get('/food/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await collection.findOne(query);
        res.send(result);
    }
    catch(e){
        console.log(e.message);
    }
})
// foods api
app.get('/foods', async(req, res)=>{
    try{
        const query = {};
        const cursor = collection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    }
    catch(e){

    }
})
// owner section api
app.get('/owner', async(req, res)=>{
    try{
        const query = {};
        const cursor = collectionOwner.find(query);
        const result = await cursor.toArray();
        res.send(result);
    }
    catch(e){

    }
})

// howIt work section api
app.get('/howItwork', async(req, res)=>{
    const query = {};
    const cursor = collectionHowItWork.find(query);
    const result = await cursor.toArray();
    res.send(result);
})

// set comment data base
app.post('/comment', async(req, res)=>{
    try{
        const userFeedBack = req.body;
        const request = await collectionComment.insertOne(userFeedBack);
        res.send(request);
    }
    catch(e){
        res.send(e.message);
    }
})

// get comment api
app.get('/comment', async(req, res)=>{
    try{
        const query ={};
        const cursor = collectionComment.find(query);
        const result = await cursor.toArray();
        res.send(result);
    }
    catch(e){
        res.send(e.message);
    }
})

app.get('/', (req, res)=>{
    res.send('server is running') 
})

app.listen(port, ()=>{
    console.log(`server running ${port} port`)
})


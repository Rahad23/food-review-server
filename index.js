const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const jwt= require('jsonwebtoken');
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.xa1zyf9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const collection = client.db("AllFood").collection("Food");
const collectionOwner = client.db("AllFood").collection("ownerData");
const collectionHowItWork = client.db("AllFood").collection("howItWorks");
const collectionComment = client.db("AllFood").collection("feedback");



// verify jwt token valid user
function verifyJwt(req, res, next){
    const authorize = req.headers.authorization;
    if(!authorize){
        console.log("No header");
      return res.status(401).send({message: "Unauthorize user"});
    }
    const key = authorize.split(' ')[1];

    jwt.verify(key, process.env.SECURITY_KEY, function(err, decode){
      if(err){
        console.log(err)
        return res.status(401).send({message: "Unauthorize user"});
      }
      req.decode = decode;
      next();
    })
}

app.post('/jwt', (req, res)=>{
    const userEmail = req.body;
    const token = jwt.sign(userEmail, process.env.SECURITY_KEY, {expiresIn: '5d'});
    res.send({token});
})

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
app.get('/comment/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const query ={foodId: id};

        const cursor = collectionComment.find(query);
        const result = await cursor.toArray();
        res.send(result);
    }
    catch(e){
        res.send(e.message);
    }
})

// edit comment api
app.get('/commentUpdate/:id', async(req, res)=>{
   try{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const cursor = await collectionComment.findOne(query);
    res.send(cursor);
   }
   catch(e){
    res.send(e.message);
   }
})

// update feedback
app.patch('/commentUpdate/:id', async(req, res)=>{
    const produtctId = req.params.id;
    // console.log(req.body);
    try{
        const query = {_id: ObjectId(produtctId)};
        // const result = await productStoreDataBase.updateOne(query);
        const result = await collectionComment.updateOne (query ,{ $set: req.body });
        console.log(result);
        res.send(result);
        // console.log(produtctId);
       }
       catch(e){
            res.send({
                response: false,
                message: e.message,
            })
       }
   
})

// user feedback delete api
app.delete('/comment/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await collectionComment.deleteOne(query);
    res.send(result);
})


// service user review fiend
app.get('/userReview/:email', verifyJwt, async(req, res)=>{
    console.log("userReview");
    const email = req.decode.email;

    if(email !== req.params.email){
       return res.status(403).send({message: "unauthorize access"})
    }
   try{
    const useremail = req.params?.email;
    if(useremail){
        const query = {email: useremail};
        const cursor = collectionComment.find(query);
        const result = await cursor.toArray();
        res.send(result);
    }
   }
   catch(e){

   }
})


// update comment api create
app.patch('/comment/:id', async(req, res)=>{
    console.log(req.params.id);
})

app.get('/', (req, res)=>{
    res.send('server is running') 
})

app.listen(port, ()=>{
    console.log(`server running ${port} port`)
})


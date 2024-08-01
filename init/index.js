const mongoose=require('mongoose');
const initData=require('./data.js');
const Listing=require('../models/listing.js');

main()
    .then((res)=>{
     console.log("connected");
    }).catch((err)=>{
     console.log(err);
    });


const initDB= async ()=>{
await Listing.deleteMany({});
initData.data = initData.data.map((obj)=>({...obj, owner:"6699ff40e07606d1249327e3"}));
await Listing.insertMany(initData.data);
console.log("data was initilized");
}

initDB();

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

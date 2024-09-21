const mongoose =require('mongoose')

const configureDB= async() =>{
    try{
const db =await mongoose.connect(process.env.DB_URL)
console.log(`MongoDB connected` );
    }
    catch(err){
console.log(`Err:${err.message}`);
    }
}

module.exports =configureDB
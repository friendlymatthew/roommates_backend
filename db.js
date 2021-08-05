const mongoose = require("mongoose");
const URI = "mongodb+srv://mostvaluableship:friendship@cluster0.ebpun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const connectDB = async() => {
    await mongoose.connect(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    mongoose.set('useFindAndModify', false);
    
    console.log("mongoDB successfully connected");
}


module.exports = connectDB;
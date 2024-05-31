import "dotenv/config";
import express from "express";
import connectDb from "./db/index.js";

const app = express();

connectDb()
  .then(() => {
    app.listen(
      (process.env.PORT || 8000,
      () => {
        console.log(`server is running at port : ${process.env.PORT}`);
      })
    );
  })
  .catch((error) => console.log("MONGO db connection feild !!", error));

// (async ()=>{
// try {
//    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//    app.on("error",(error)=>{
//     console.log("not talking");
//     throw error
//    })
//    app.listen(process.env.PORT,()=>{
//     console.log("app is started on"+process.env.PORT);
//    })
// } catch (error) {
//     console.log(error);
// }
// })()

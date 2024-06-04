// import "dotenv/config";
// import connectDb from "./db/index.js";
// import {app} from './app.js'



// connectDb()
//   .then(() => {
//     app.listen(
//       (process.env.PORT || 7000,
//       () => {
//         console.log(`server is running at port : http://localhost:${process.env.PORT}`);
//       })
//     );
//   })
//   .catch((error) => console.log("MONGO db connection feild !!", error));

import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from './app.js';
dotenv.config({
  path:'./.env'
})

connectDb()
  .then(() => {
    const port = 8632;
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log("MONGO db connection failed !!", error));


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

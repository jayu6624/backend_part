import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connection1 = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log("MONGODB connected " + connection1.connection.host);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export default connectDb;
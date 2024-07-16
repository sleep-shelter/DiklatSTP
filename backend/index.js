import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/UserRoute.js";
import DaftarDiklatRoute from "./routes/DaftarDiklatRoute.js";

dotenv.config();
const app = express();
app.use(cors( { credentials:true, origin:'http://localhost:4200' }));
app.use(cookieParser());
app.use(express.json());
app.use(UserRoute);
app.use(DaftarDiklatRoute);

app.listen(5000, ()=> console.log('Server up and running...'));
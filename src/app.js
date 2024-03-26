import express from 'express';
import userRouter from './api/routes/user.js';
import connectDB from './confic/db.js';



const app = express();
connectDB()
const port = 3000;

app.use(express.json());

app.use('/api/v1',userRouter )


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
 


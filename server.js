import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import {connectDB} from './config/dbConnect.js';

dotenv.config();

const port = process.env.PORT || 3000; 

const server = http.createServer(app);

 connectDB();
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


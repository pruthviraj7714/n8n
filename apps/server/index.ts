import express from 'express';
import userRouter from './routes/user.routes';
import workflowRouter from './routes/workflow.routes';
import credentialRouter from './routes/credential.routes';
import cors from 'cors';
import streamRouter from './routes/stream.route';

const app = express();

app.use(express.json())
app.use(cors())

app.use('/api/v1/user', userRouter);
app.use('/api/v1/workflow', workflowRouter);
app.use('/api/v1/credentials', credentialRouter);
app.use('/api/v1/stream', streamRouter);


app.listen(3001, () => {
    console.log('server is running on port 3001');
})
import express, { Response, Request, NextFunction } from 'express';

import bodyParser from 'body-parser';
import authRouter from './auth';
import jwtRouter from './jwt';
import { DeleteFromDataSent, InsertIntoDataSent, useDB } from './dbManager';




const app = express()


const port = 4000



function logger(req: Request, res: Response, next: NextFunction) {

  console.log(req.ip + ' made a ' + req.method + ' request to ' + req.url + ' payload: ' + req.body.username);
  next();
}



app.use(express.static('docs'));
app.use(bodyParser.json());

app.use(logger);

app.use(jwtRouter);



app.post('/', async (req, res, next) => {

  await useDB(InsertIntoDataSent, req.body.name, next);

  res.status(201).json({ message: 'data added successfully' });

})

app.post('/delete', async (req, res, next) => {

  await useDB(DeleteFromDataSent, req.body.value_string, next);

  res.status(200).json({ message: 'data deleted successfully' });

})


app.get('/dataItems', (req, res) => {

  res.send([]);

})

// error hanlder must come after everythign
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(err.message);

  if (req.url === '/auth' || req.url === '/addUser') {
    return res.status(401).json({ message: err.message });
  }

  return res.status(500);
}

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
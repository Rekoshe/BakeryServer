import express, { Response, Request, NextFunction } from 'express';
import pgPromise from 'pg-promise';
import bodyParser from 'body-parser';
import authRouter from './auth';
import env from './config'


const pgp = pgPromise();

const app = express()
const db = pgp(env.DB)

const port = 4000



function logger(req: Request, res: Response, next: NextFunction) {

  console.log(req.ip + ' made a ' + req.method + ' request to ' + req.url + ' payload: ' + req.body.username);
  next();
}



app.use(express.static('build'));
app.use(bodyParser.json());

app.use(logger);

app.use(authRouter);

app.post('/', (req, res) => {

  db.none('INSERT INTO dataSent (value_string) VALUES($1)', req.body.name).then(
    () => {
      console.log(req.body.name + " has been added to the dataBase");
    }
  ).catch(error => {
    console.log(error)
  })


  res.end();

})

app.post('/delete', (req, res) => {
  db.none('DELETE FROM dataSent WHERE data_id = $1', req.body.data_id).then(
    () => {
      console.log(req.body.value_string + " has been deleted from the database");
    }
  ).catch((e) => {
    console.log(e);
  })

  res.end();
})






app.get('/dataItems', (req, res) => {

  db.any('SELECT * FROM dataSent').then((data) => {

    res.send(data);
  }).catch((e) => {

    console.log(e);
  })

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
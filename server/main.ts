import * as fs from 'fs';
import express from 'express';

const port = 3001;
const app = express();

app.get('/', (req, res) => {
  res.send('Rock and Roll, little lizard, oh yeah');
});

app.get('/data', (req, res) => {
  fs.readFile('./data.json', (err, json) => {
    let obj = JSON.parse(json);
    res.json(obj);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

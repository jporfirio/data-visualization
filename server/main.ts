import * as fs from 'fs';
import express from 'express';

const port = 3000;
const app = express();

app.get('/data', (req, res) => {
  fs.readFile('./data.json', (err, json) => {
    let obj = JSON.parse(json);
    res.json(obj);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

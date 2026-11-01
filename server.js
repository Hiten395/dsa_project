const express = require('express');
const path = require('node:path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, 'public');

app.use(express.static(publicDirectory));
app.get(/.*/, (req, res) => res.sendFile(path.join(publicDirectory, 'index.html')));

app.listen(port, () => {
  console.log(`Structure Lab is running at http://localhost:${port}`);
});

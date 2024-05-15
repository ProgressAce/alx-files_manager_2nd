// API Main point
const express = require('express');
const indexRoutes = require('./routes/index');

const port = process.env.PORT || '5000';
const app = express();

app.use(indexRoutes);
app.listen(port, () => console.log(`API running on port ${port}`));

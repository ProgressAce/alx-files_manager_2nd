// API Main point
const express = require('express');
const indexRoutes = require('./routes/index');

const PORT = process.env.PORT || '5000';
const app = express();

app.use(indexRoutes);
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

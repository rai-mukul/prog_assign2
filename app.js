require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const characterRoutes = require('./routes/characterRoutes');
const neo4j = require('neo4j-driver');

const app = express();

// Middleware
app.use(bodyParser.json());

// Neo4j connection
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Pass Neo4j driver to routes
app.use((req, res, next) => {
  req.driver = driver;
  next();
});

// Routes
app.use('/chars', characterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

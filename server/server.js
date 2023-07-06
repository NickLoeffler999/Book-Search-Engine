const express = require("express");
// Requiring ApolloServer will add the Apollo Server to our Express server as middleware.
const { ApolloServer } = require("apollo-server-express");
// This will import our authorization middleware function to be configured with the Apollo Server.
const { authMiddleware } = require("./utils/auth");

const path = require("path");
const db = require("./config/connection");
const routes = require("./routes");

// Here we are importing our typeDefs and resolvers from the schemas directory.
const { typeDefs, resolvers } = require("./schemas");

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// This will start the Apollo Server.
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
};

db.once("open", () => {
  startApolloServer();
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});

startApolloServer();

// app.use(routes);

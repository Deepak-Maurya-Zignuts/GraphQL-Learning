const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { default: axios } = require("axios");

async function startServer() {
    const app = express();
    const server = new ApolloServer({
        // typeDefs: './schema.graphql',
        // resolvers: {
        //     Query: {
        //         hello: () => 'Hello world!',
        //     },
        // },
        typeDefs: `
            type User {
                id: ID!
                name: String!
                username: String!
                email: String!
                address: String!
                phone: String!
                website: String!
                company: String!
            }
            
            type Todo {
                id: ID!
                userId: ID!
                title: String!
                completed: Boolean
                user: User
            }

            type Query {
                getTodos: [Todo]
                getAllUsers: [User]
                getUser(id: ID!): User
            }
            
        `,
        resolvers: {
            Todo: {
                user: async (todo) => {
                    return todo.user? todo.user : (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data;
                }
            },
            Query: {
                getTodos: async () =>
                    (
                        await axios.get(
                            "https://jsonplaceholder.typicode.com/todos"
                        )
                    ).data,
                getAllUsers: async () =>
                    (
                        await axios.get(
                            "https://jsonplaceholder.typicode.com/users"
                        )
                    ).data,
                getUser: async (parent, { id }) =>
                    (
                        await axios.get(
                            `https://jsonplaceholder.typicode.com/users/${id}`
                        )
                    ).data,
            },
        },
    });

    app.use(cors());
    app.use(express.json());

    await server.start();

    app.use("/graphql", expressMiddleware(server));

    app.listen({ port: 4000 }, () => {
        console.log(
            `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
        );
    });
}

startServer();

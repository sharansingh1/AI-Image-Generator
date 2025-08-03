import { ApolloServer, gql } from 'apollo-server-micro'
import axios from 'axios'
import Cors from 'micro-cors'

const cors = Cors()

const typeDefs = gql`
  type Query {
    generateImages(
      prompt: String!
      negativePrompt: String
      width: Int
      height: Int
      cfgScale: Float
      seed: Int
      samples: Int
    ): [String!]!
  }
`

const resolvers = {
    Query: {
        async generateImages(_, { prompt, negativePrompt, width, height, cfgScale, seed, samples }) {
            // ... your existing generateImages logic here ...
            // Copy the whole function from your original backend file.
        }
    }
}

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
})

const startServer = apolloServer.start()

export default cors(async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.end()
        return false
    }
    await startServer
    await apolloServer.createHandler({
        path: '/api/graphql',
    })(req, res)
})

export const config = {
    api: {
        bodyParser: false,
    },
}

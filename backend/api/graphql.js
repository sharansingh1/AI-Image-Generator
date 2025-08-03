import { ApolloServer, gql } from 'apollo-server-micro'
import Cors from 'micro-cors'

// Paste your existing typeDefs and resolvers here, or import them

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
        async generateImages(_, args) {
            // Your existing resolver code here
        },
    },
}

const cors = Cors({
    origin: '*',  // You can customize allowed origins here
    allowMethods: ['POST', 'GET', 'OPTIONS'],
})

const apolloServer = new ApolloServer({ typeDefs, resolvers })

const startServer = apolloServer.start()

export default cors(async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.end()
        return false
    }
    await startServer
    await apolloServer.createHandler({ path: '/api/graphql' })(req, res)
})

export const config = {
    api: {
        bodyParser: false, // Apollo Server handles body parsing itself
    },
}

import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { ApolloServer, gql } from 'apollo-server-micro';

// ---- Initialize CORS middleware ----
const cors = Cors({
    origin: 'https://ai-image-generator-7pr7563cu-sharans-projects-b657e838.vercel.app', // your frontend domain
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
});

// Helper to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: unknown) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// ---- GraphQL schema & resolvers (dummy example) ----
// Replace this with your actual schema & resolvers
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
`;

const resolvers = {
    Query: {
        generateImages: async (
            _: unknown,
            { prompt, width, height, cfgScale, seed, samples }: any
        ) => {
            // Your AI image generation logic here
            // return array of base64 image URLs or image links
            return [
                'https://dummyimage.com/1024x1024/000/fff.png&text=AI+Image+1',
                'https://dummyimage.com/1024x1024/111/fff.png&text=AI+Image+2',
                'https://dummyimage.com/1024x1024/222/fff.png&text=AI+Image+3',
            ];
        },
    },
};

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const startServer = apolloServer.start();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run CORS
    await runMiddleware(req, res, cors);

    // Handle preflight (OPTIONS) request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await startServer;
    await apolloServer.createHandler({
        path: '/api/graphql',
    })(req, res);
}

// ---- Important for Next.js ----
export const config = {
    api: {
        bodyParser: false,
    },
};

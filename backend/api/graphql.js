import { ApolloServer, gql } from 'apollo-server-micro';
import axios from 'axios';

// === Apollo GraphQL Schema ===
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
        async generateImages(_, { prompt, negativePrompt, width, height, cfgScale, seed, samples }) {
            const numSamples = Math.min(samples || 1, 4);
            const imagePromises = [];

            for (let i = 0; i < numSamples; i++) {
                const imageSeed = seed ? seed + i : Math.floor(Math.random() * 1000000);
                const fullPrompt = negativePrompt ? `${prompt}, negative: ${negativePrompt}` : prompt;
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?${new URLSearchParams({
                    width: (width || 512).toString(),
                    height: (height || 512).toString(),
                    seed: imageSeed.toString(),
                    model: 'flux',
                    nologo: 'true'
                })}`;

                const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const base64 = Buffer.from(res.data).toString('base64');
                const mimeType = res.headers['content-type'] || 'image/jpeg';
                imagePromises.push(`data:${mimeType};base64,${base64}`);
            }

            return Promise.all(imagePromises);
        }
    }
};

// === Apollo Server ===
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
});

const startServer = apolloServer.start();

// === Vercel API Handler ===
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // <-- for testing, allow all
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.end();
        return;
    }

    await startServer;
    await apolloServer.createHandler({ path: '/api/graphql' })(req, res);
}

// === Disable Vercel body parsing ===
export const config = {
    api: {
        bodyParser: false
    }
};

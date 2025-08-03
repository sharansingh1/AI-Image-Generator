import { ApolloServer, gql } from 'apollo-server-micro';
import axios from 'axios';

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

const apolloServer = new ApolloServer({ typeDefs, resolvers });
const startServer = apolloServer.start();

export default async function handler(req, res) {
    // ✅ Set CORS first
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-image-generator-mnrmgwqhb-sharans-projects-b657e838.vercel.app'); // frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await startServer;
    return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
}

export const config = { api: { bodyParser: false } };

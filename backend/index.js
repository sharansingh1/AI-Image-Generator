import { ApolloServer, gql } from 'apollo-server'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

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
            try {
                // Pollinations AI doesn't require an API key - it's completely free!
                const numSamples = Math.min(samples || 1, 4);
                console.log(`🌸 Generating ${numSamples} images with Pollinations AI (Free & Fast)...`);
                console.log(`📝 Prompt: "${prompt}"`);

                const imagePromises = [];

                for (let i = 0; i < numSamples; i++) {
                    const imageSeed = seed ? seed + i : Math.floor(Math.random() * 1000000);
                    console.log(`⚡ Starting generation ${i + 1}/${numSamples} (seed: ${imageSeed})...`);

                    // Pollinations AI uses a simple URL-based API
                    const imagePromise = (async () => {
                        try {
                            // Build the URL with parameters
                            const baseUrl = 'https://image.pollinations.ai/prompt';
                            const encodedPrompt = encodeURIComponent(prompt);

                            // Add negative prompt if provided
                            const fullPrompt = negativePrompt
                                ? `${prompt}, negative: ${negativePrompt}`
                                : prompt;

                            const finalEncodedPrompt = encodeURIComponent(fullPrompt);

                            // Construct URL with parameters
                            const imageUrl = `${baseUrl}/${finalEncodedPrompt}?` + new URLSearchParams({
                                width: (width || 512).toString(),
                                height: (height || 512).toString(),
                                seed: imageSeed.toString(),
                                model: 'flux', // Use the flux model for better quality
                                nologo: 'true'
                            });

                            console.log(`📸 Requesting image ${i + 1}: ${imageUrl.substring(0, 100)}...`);

                            // Download the image
                            const response = await axios.get(imageUrl, {
                                responseType: 'arraybuffer',
                                timeout: 60000, // 60 second timeout
                                headers: {
                                    'User-Agent': 'AI-Image-Generator/1.0'
                                }
                            });

                            // Convert to base64
                            const base64 = Buffer.from(response.data).toString('base64');
                            const mimeType = response.headers['content-type'] || 'image/jpeg';

                            console.log(`✅ Successfully generated image ${i + 1}/${numSamples}`);
                            return `data:${mimeType};base64,${base64}`;

                        } catch (error) {
                            console.error(`❌ Failed to generate image ${i + 1}:`, error.message);

                            // Try alternative approach with simpler URL
                            try {
                                console.log(`🔄 Retrying image ${i + 1} with simplified approach...`);

                                const simpleUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width || 512}&height=${height || 512}&seed=${imageSeed}`;

                                const retryResponse = await axios.get(simpleUrl, {
                                    responseType: 'arraybuffer',
                                    timeout: 60000,
                                    headers: {
                                        'User-Agent': 'AI-Image-Generator/1.0'
                                    }
                                });

                                const base64 = Buffer.from(retryResponse.data).toString('base64');
                                const mimeType = retryResponse.headers['content-type'] || 'image/jpeg';

                                console.log(`✅ Successfully generated image ${i + 1}/${numSamples} (retry)`);
                                return `data:${mimeType};base64,${base64}`;

                            } catch (retryError) {
                                console.error(`❌ Retry also failed for image ${i + 1}:`, retryError.message);
                                return null;
                            }
                        }
                    })();

                    imagePromises.push(imagePromise);

                    // Add small delay between requests to be nice to the free service
                    if (i < numSamples - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                // Wait for all images to complete
                console.log(`⏳ Waiting for all ${numSamples} images to complete...`);
                const images = await Promise.all(imagePromises);
                const validImages = images.filter(img => img !== null);

                if (!validImages.length) {
                    throw new Error('No images were generated successfully. Please try again with a different prompt.');
                }

                console.log(`🎉 Successfully generated ${validImages.length}/${numSamples} images`);
                return validImages;

            } catch (error) {
                console.error('❌ Error in image generation process:', error.message);

                // Provide helpful error messages
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Cannot connect to Pollinations AI. Please check your internet connection.');
                } else if (error.code === 'ETIMEDOUT') {
                    throw new Error('Request timed out. The service might be busy, please try again.');
                } else if (error.response?.status === 429) {
                    throw new Error('Too many requests. Please wait a moment and try again.');
                } else if (error.response?.status >= 500) {
                    throw new Error('Pollinations AI service is temporarily unavailable. Please try again later.');
                } else {
                    throw new Error(`Image generation failed: ${error.message}`);
                }
            }
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
})

server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
    console.log('🌸 Using Pollinations AI for image generation')
    console.log('🆓 Completely free - no API key required!')
    console.log('⚡ Fast direct image generation')
    console.log('🎨 Supports multiple models and styles')
    console.log('📊 URL-based API with instant results')
    console.log('🔗 Learn more at: https://pollinations.ai/')
})
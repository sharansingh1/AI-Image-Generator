import React, { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useLazyQuery } from '@apollo/client';
import { Loader2, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import './App.css';

// Apollo Client setup
const client = new ApolloClient({
  uri: 'http://localhost:4000', // Your GraphQL server
  cache: new InMemoryCache(),
});

// GraphQL query
const GENERATE_IMAGES = gql`
  query GenerateImages(
    $prompt: String!
    $negativePrompt: String
    $width: Int
    $height: Int
    $cfgScale: Float
    $seed: Int
    $samples: Int
  ) {
    generateImages(
      prompt: $prompt
      negativePrompt: $negativePrompt
      width: $width
      height: $height
      cfgScale: $cfgScale
      seed: $seed
      samples: $samples
    )
  }
`;

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState({
    width: 1024,
    height: 1024,
    cfgScale: 7,
    samples: 4,
  });

  const [generateImages, { loading, error }] = useLazyQuery(GENERATE_IMAGES, {
    onCompleted: (data) => {
      const newImages = data.generateImages;
      setCurrentImages(newImages);

      // Add to gallery
      const newGalleryItems: GeneratedImage[] = newImages.map((url: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt,
        timestamp: Date.now(),
      }));

      const updatedGallery = [...newGalleryItems, ...gallery].slice(0, 50); // Keep last 50 images
      setGallery(updatedGallery);
      localStorage.setItem('ai-image-gallery', JSON.stringify(updatedGallery));
    },
    onError: (error) => {
      console.error('Generation error:', error);
    }
  });

  // Load gallery from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-image-gallery');
    if (saved) {
      try {
        setGallery(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading gallery:', e);
      }
    }
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    generateImages({
      variables: {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || null,
        ...settings,
      },
    });
  };

  const downloadImage = (url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.click();
  };

  const clearGallery = () => {
    setGallery([]);
    localStorage.removeItem('ai-image-gallery');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your imagination into stunning visuals with our advanced AI technology
          </p>
        </header>

        {/* Main Generator Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="max-w-2xl mx-auto">
            {/* Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-3">
                Describe your image
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene landscape with mountains and a crystal clear lake at sunset..."
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none h-24 text-gray-700"
                disabled={loading}
              />
            </div>

            {/* Advanced Settings Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width: {settings.width}px
                    </label>
                    <input
                      type="range"
                      min="512"
                      max="1536"
                      step="64"
                      value={settings.width}
                      onChange={(e) => setSettings({ ...settings, width: parseInt(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height: {settings.height}px
                    </label>
                    <input
                      type="range"
                      min="512"
                      max="1536"
                      step="64"
                      value={settings.height}
                      onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CFG Scale: {settings.cfgScale}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={settings.cfgScale}
                      onChange={(e) => setSettings({ ...settings, cfgScale: parseFloat(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images: {settings.samples}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="1"
                      value={settings.samples}
                      onChange={(e) => setSettings({ ...settings, samples: parseInt(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Negative Prompt (what to avoid)
                  </label>
                  <input
                    id="negativePrompt"
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, low quality, distorted..."
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Images...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Images
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-medium">Error generating images:</p>
                <p className="text-red-600 text-sm mt-1">{error.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Generated Images */}
        {currentImages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Generated Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                >
                  <img
                    src={image}
                    alt={`Generated: ${prompt}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(image, prompt)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform scale-90 group-hover:scale-100"
                      title="Download image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {gallery.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <ImageIcon className="w-7 h-7 text-blue-600" />
                Image Gallery
              </h2>
              <button
                onClick={clearGallery}
                className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
              >
                Clear Gallery
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(item.url, item.prompt)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
                      title={`Download: ${item.prompt.slice(0, 50)}...`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-xs truncate">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ImageGenerator />
    </ApolloProvider>
  );
};

export default App;
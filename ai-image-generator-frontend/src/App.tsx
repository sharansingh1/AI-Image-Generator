import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Sparkles, Zap, Palette, ImageIcon, ChevronDown, Menu, X } from 'lucide-react';

const AIImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('enhance');
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const styles = [
    { id: 'enhance', name: 'Enhanced', description: 'High quality, detailed' },
    { id: 'artistic', name: 'Artistic', description: 'Creative, stylized' },
    { id: 'photorealistic', name: 'Photorealistic', description: 'Natural, realistic' },
    { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality' },
    { id: 'abstract', name: 'Abstract', description: 'Creative, unique' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (generatedImages.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % generatedImages.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [generatedImages.length]);

  const generateImages = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
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
          `,
          variables: {
            prompt: `${prompt}, ${selectedStyle} style`,
            negativePrompt: "",
            width: 1024,
            height: 1024,
            cfgScale: 7,
            seed: Math.floor(Math.random() * 100000),
            samples: 3
          }
        })
      });

      const data = await response.json();
      if (data.data?.generateImages) {
        setGeneratedImages(data.data.generateImages);
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error('Error generating images:', error);
    }
    setIsGenerating(false);
  };

  const downloadImage = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `ai-generated-image-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">imaginAI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <button className="text-gray-300 hover:text-white transition-colors">Gallery</button>
          <button className="text-gray-300 hover:text-white transition-colors">Pricing</button>
          <button className="text-gray-300 hover:text-white transition-colors">About</button>
          <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20">
            Get in touch
          </button>
        </div>
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-black/90 backdrop-blur-sm z-50 p-6">
          <div className="flex flex-col space-y-4">
            <button className="text-gray-300 hover:text-white transition-colors text-left">Gallery</button>
            <button className="text-gray-300 hover:text-white transition-colors text-left">Pricing</button>
            <button className="text-gray-300 hover:text-white transition-colors text-left">About</button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20 text-left">
              Get in touch
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
        {/* Hero + Preview */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              creation
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                through
              </span>
              <br />
              imagination
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Transform your ideas into stunning visuals with our advanced AI.
              Create professional-quality images in seconds.
            </p>
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Multiple Styles</span>
              </div>
            </div>
            <button
              onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Discover our solutions
            </button>
          </div>

          <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
            {generatedImages.length > 0 ? (
              <>
                <img
                  src={generatedImages[currentImageIndex]}
                  alt="Generated AI Image"
                  className="w-full h-full object-cover transition-opacity duration-1000"
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                  {generatedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-24 h-24 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Your generated images will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generator Section */}
        <div id="generator" className="mt-24 lg:mt-32">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Create Your Vision</h2>
              <p className="text-xl text-gray-300">Describe what you want to see, and watch it come to life</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Style Selector */}
              <div className="relative">
                <label className="block text-white font-medium mb-3">Choose Style</label>
                <button
                  onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-white flex items-center justify-between hover:bg-white/15 transition-all duration-300"
                >
                  <div className="text-left">
                    <div className="font-medium">{styles.find(s => s.id === selectedStyle)?.name}</div>
                    <div className="text-sm text-gray-400">{styles.find(s => s.id === selectedStyle)?.description}</div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showStyleDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showStyleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden z-50">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setShowStyleDropdown(false);
                        }}
                        className="w-full px-6 py-4 text-left hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="text-white font-medium">{style.name}</div>
                        <div className="text-sm text-gray-400">{style.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-white font-medium mb-3">Describe your image</label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A majestic dragon flying over a futuristic city at sunset..."
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 h-32 resize-none"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Camera className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateImages}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating magic...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Sparkles className="w-6 h-6" />
                    <span>Generate Images</span>
                  </div>
                )}
              </button>

              {/* Generated Images Grid */}
              {generatedImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative overflow-hidden rounded-2xl bg-gray-800 aspect-square">
                        <img
                          src={image}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                        <button
                          onClick={() => downloadImage(image, index)}
                          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-24 pb-12 text-center text-gray-400">
        </footer>
      </div>
    </div>
  );
};

export default AIImageGenerator;

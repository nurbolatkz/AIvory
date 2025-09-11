"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Search,
  Filter,
  Sparkles,
  Users,
  Crown,
  Heart,
  Download,
  Play,
  X,
  Upload,
  Camera,
  Zap,
  Share2,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useApi, type Effect, type Category } from "@/hooks/useApi"
import { fetchManager } from "@/lib/api"

export default function GalleryPage() {
  const { effects: presets, categories, loading, error } = useApi();
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<Effect | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isApplyingEffect, setIsApplyingEffect] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)

  const handleTryNow = (preset: Effect) => {
    setSelectedPreset(preset)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setSelectedPreset(null)
    setIsApplyingEffect(false)
    setUploadedImage(null)
    setProcessedImage(null)
    setIsProcessing(false)
    setUploadedImageId(null)
  }

  const handleApplyEffect = () => {
    setIsApplyingEffect(true)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        setIsProcessing(true);
        // Upload the image to get an ID
        const formData = new FormData();
        formData.append('image', file);
        const imageData = await fetchManager.uploadImage(formData);
        setUploadedImageId(imageData.id);
        setUploadedImage(URL.createObjectURL(file));
        setIsProcessing(false);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        alert(`Error uploading image: ${error.message || 'Unknown error'}`);
        setIsProcessing(false);
      }
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      alert("Camera feature would open here! For demo, please use upload instead.")
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      alert("Camera access denied or not available")
    }
  }

  const handleSaveResult = () => {
    if (processedImage && selectedPreset) {
      const link = document.createElement("a")
      link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, "-")}-effect.jpg`
      link.href = processedImage
      link.click()
    }
  }

  const handleShareResult = async () => {
    if (selectedPreset && navigator.share && processedImage) {
      try {
        await navigator.share({
          title: `Check out my ${selectedPreset.name} effect!`,
          text: `I just created this amazing effect using ${selectedPreset.name} on EFFECTZ!`,
          url: window.location.href,
        })
      } catch (error) {
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const processSelectedEffect = async () => {
    if (!uploadedImageId || !selectedPreset) return;

    try {
      setIsProcessing(true);
      // Apply the selected effect to the uploaded image
      const result = await fetchManager.applyEffect(uploadedImageId, selectedPreset.id);
      
      // The result contains the ID of the processed image
      // We need to poll for the actual processed image
      const processedId = result.id || result.processed_image_id;
      
      if (!processedId) {
        throw new Error('Invalid response from server: No ID for polling');
      }
      
      // Poll for the processed image status
      const processedResult = await pollForProcessedResult(processedId);
      setProcessedImage(processedResult.processed_image || processedResult.original_image);
      setIsProcessing(false);
    } catch (error: any) {
      console.error("Error applying effect:", error);
      alert(`Error applying effect: ${error.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  }

  // Poll for processed result
  const pollForProcessedResult = async (processedId: string) => {
    console.log('Starting pollForProcessedResult with ID:', processedId);
    
    // Increase timeout for long-running operations
    const pollInterval = 3000; // 3 seconds
    const maxAttempts = 40; // 120 seconds max
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          console.log(`Polling attempt ${attempts} for processed image ${processedId}`);
          
          // Check if we've exceeded max attempts
          if (attempts > maxAttempts) {
            console.log('Polling timeout reached');
            reject(new Error('Image processing is taking longer than expected. Please try again.'));
            return;
          }
          
          // Get the processed image status
          console.log('Fetching status for:', processedId);
          const result = await fetchManager.getProcessedStatus(processedId);
          console.log(`Polling attempt ${attempts} result:`, result);
          
          if (!result) {
            console.error('Empty response from server');
            reject(new Error('Empty response from server'));
            return;
          }
          
          // Handle string responses
          let statusResult;
          if (typeof result === 'string') {
            try {
              statusResult = JSON.parse(result);
              console.log('Parsed status result:', statusResult);
            } catch (parseError) {
              console.error('Failed to parse status response:', parseError);
              statusResult = {
                status: 'failed',
                error_message: 'Invalid response format from server'
              };
            }
          } else {
            statusResult = result;
          }
          
          console.log('Status result:', statusResult);
          console.log('Status result status:', statusResult.status);
          
          // Make sure we're checking all possible status values
          if (statusResult.status === 'completed') {
            console.log('Processing completed:', statusResult);
            resolve(statusResult);
          } else if (statusResult.status === 'failed') {
            console.log('Processing failed:', statusResult);
            reject(new Error(statusResult.error_message || 'Image processing failed'));
          } else {
            // Continue polling for 'processing' or any other status
            console.log(`Scheduling next poll in ${pollInterval}ms`);
            setTimeout(poll, pollInterval);
          }
        } catch (err) {
          console.error('Error during polling:', err);
          reject(err);
        }
      };
      
      // Start polling
      console.log('Starting first poll');
      poll();
    });
  };

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory = selectedCategory === "all" || preset.category_name === selectedCategory
    const matchesSearch =
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (preset.tags && preset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCategory && matchesSearch
  })

  const featuredPresets = presets.filter((preset) => preset.featured)

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border/20 p-4">
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-secondary inline-block">
                Effect Gallery
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Discover and try amazing effects</p>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading effects...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border/20 p-4">
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-secondary inline-block">
                Effect Gallery
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Discover and try amazing effects</p>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 flex items-center justify-center h-96">
          <div className="text-center p-4">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Error Loading Effects</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border/20 p-4">
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-secondary inline-block">
              Effect Gallery
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Discover and try amazing effects</p>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search effects, tags, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card/30 backdrop-blur border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Featured Section */}
        {searchQuery === "" && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" />
              Featured Effects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className="bg-card/50 backdrop-blur border-border/30 overflow-hidden group hover:bg-card/70 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={preset.preview || preset.thumbnail || "/placeholder.svg"}
                      alt={preset.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-primary text-white border-primary">{preset.badge}</Badge>
                    <Button
                      size="sm"
                      className="absolute bottom-3 right-3 bg-primary/20 backdrop-blur hover:bg-primary/30"
                      onClick={() => handleTryNow(preset)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Try Now
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{preset.name}</h3>
                        <p className="text-sm text-muted-foreground">by {preset.creator || 'Unknown'}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-border text-foreground">
                        {preset.difficulty || 'Beginner'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{preset.description || preset.user_description || 'No description available'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {preset.users || '0k'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {preset.likes || '0k'}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {preset.tags && preset.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} className="text-xs bg-secondary/30 text-white border-secondary/50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Category Filters */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              key="all"
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-transparent border-border/30 hover:bg-card/50 text-foreground"
              }`}
            >
              🎨 All
              <Badge className="ml-2 bg-secondary/30 text-white text-xs border-secondary/50">{presets.length}</Badge>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id.toString()
                    ? "bg-primary text-white"
                    : "bg-transparent border-border/30 hover:bg-card/50 text-foreground"
                }`}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
                <Badge className="ml-2 bg-secondary/30 text-white text-xs border-secondary/50">{category.count || 0}</Badge>
              </Button>
            ))}
          </div>
        </section>

        {/* Effects Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {selectedCategory === "all"
                ? "All Effects"
                : categories.find((c) => c.id.toString() === selectedCategory)?.name + " Effects"}
            </h2>
            <p className="text-sm text-muted-foreground">{filteredPresets.length} effects found</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPresets.map((preset) => (
              <Card
                key={preset.id}
                className="bg-card/30 backdrop-blur border-border/30 overflow-hidden group hover:bg-card/50 transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={preset.preview || preset.thumbnail || "/placeholder.svg"}
                    alt={preset.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Badge className="absolute top-2 left-2 bg-primary text-white border-primary text-xs">
                    {preset.badge}
                  </Badge>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className="bg-primary/20 backdrop-blur hover:bg-primary/30 text-xs"
                      onClick={() => handleTryNow(preset)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Try
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm truncate">{preset.name}</h3>
                      <p className="text-xs text-muted-foreground">by {preset.creator || 'Unknown'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 border-border text-foreground">
                      {preset.difficulty || 'Beginner'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {preset.users || '0k'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {preset.likes || '0k'}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-auto">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredPresets.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No effects found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or category filter</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {isPreviewOpen && selectedPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-card/90 backdrop-blur border border-border/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div>
                <h2 className="text-2xl font-bold">{selectedPreset.name}</h2>
                <p className="text-muted-foreground">by {selectedPreset.creator || 'Unknown'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {!isApplyingEffect ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <img
                      src={selectedPreset.preview || selectedPreset.thumbnail || "/placeholder.svg"}
                      alt={selectedPreset.name}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <div className="flex gap-2">
                      {selectedPreset.tags && selectedPreset.tags.map((tag) => (
                        <Badge key={tag} className="bg-secondary/30 text-white border-secondary/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedPreset.description || selectedPreset.user_description || 'No description available'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Difficulty</p>
                        <Badge variant="outline" className="border-border text-foreground">
                          {selectedPreset.difficulty || 'Beginner'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <Badge className="bg-primary text-white">{selectedPreset.category_name}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedPreset.users || '0'} users
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {selectedPreset.likes || '0'} likes
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                        onClick={handleApplyEffect}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Apply Effect
                      </Button>
                      <Button variant="outline" className="border-border hover:bg-card/50 bg-transparent">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="border-border hover:bg-card/50 bg-transparent">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {!uploadedImage ? (
                    <div className="text-center space-y-6">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Choose Your Image</h3>
                        <p className="text-muted-foreground">
                          Upload a photo or take a new one to apply the {selectedPreset.name} effect
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={isProcessing}
                          />
                          <label htmlFor="image-upload">
                            <Button
                              className="w-full h-24 flex-col gap-2 bg-primary/20 hover:bg-primary/30 border-2 border-dashed border-primary/50"
                              asChild
                              disabled={isProcessing}
                            >
                              <div className="cursor-pointer">
                                {isProcessing ? (
                                  <div className="flex flex-col items-center">
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                                    <span className="text-sm">Uploading...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-6 h-6" />
                                    <span className="text-sm">Upload Photo</span>
                                  </>
                                )}
                              </div>
                            </Button>
                          </label>
                        </div>

                        <Button
                          className="w-full h-24 flex-col gap-2 bg-secondary/20 hover:bg-secondary/30 border-2 border-dashed border-secondary/50"
                          onClick={handleCameraCapture}
                        >
                          <Camera className="w-6 h-6" />
                          <span className="text-sm">Take Photo</span>
                        </Button>
                      </div>

                      <Button variant="outline" onClick={() => setIsApplyingEffect(false)}>
                        Back to Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">
                          {isProcessing ? "Applying Effect..." : processedImage ? "Effect Applied!" : "Preview Image"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isProcessing
                            ? "Processing your image with AI magic ✨"
                            : processedImage
                            ? "Your image is ready! Save or share it below."
                            : "Preview your uploaded image before applying the effect."}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Before */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-center">Before</h4>
                          <div className="relative">
                            <img
                              src={uploadedImage || "/placeholder.svg"}
                              alt="Original"
                              className="w-full h-64 object-cover rounded-xl"
                            />
                          </div>
                        </div>

                        {/* After */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-center">
                            {isProcessing ? "Processing..." : processedImage ? "After" : "Preview"}
                          </h4>
                          <div className="relative">
                            {isProcessing ? (
                              <div className="w-full h-64 bg-card/30 rounded-xl flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="animate-spin">
                                    <Zap className="w-8 h-8 text-primary" />
                                  </div>
                                  <p className="text-sm text-muted-foreground">Processing...</p>
                                </div>
                              </div>
                            ) : processedImage ? (
                              <img
                                src={processedImage || "/placeholder.svg"}
                                alt="Processed"
                                className="w-full h-64 object-cover rounded-xl ring-2 ring-primary/50"
                              />
                            ) : (
                              <div className="w-full h-64 bg-card/30 rounded-xl flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">Effect will appear here</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center">
                        {!processedImage ? (
                          <Button
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                            onClick={processSelectedEffect}
                            disabled={isProcessing || !uploadedImageId}
                          >
                            {isProcessing ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Apply {selectedPreset.name} Effect
                              </>
                            )}
                          </Button>
                        ) : (
                          <>
                            <Button
                              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                              onClick={handleSaveResult}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Image
                            </Button>
                            <Button
                              variant="outline"
                              className="border-border hover:bg-card/50 bg-transparent"
                              onClick={handleShareResult}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              className="border-border hover:bg-card/50 bg-transparent"
                              onClick={() => {
                                setUploadedImage(null)
                                setProcessedImage(null)
                                setUploadedImageId(null)
                              }}
                            >
                              Try Another
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
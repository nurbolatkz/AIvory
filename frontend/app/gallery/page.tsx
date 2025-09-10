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

const categories = [
  { id: "all", name: "All", count: 156 },
  { id: "beginner", name: "Beginner", count: 42, icon: "🌟" },
  { id: "intermediate", name: "Intermediate", count: 68, icon: "⚡" },
  { id: "expert", name: "Expert", count: 32, icon: "👑" },
  { id: "viral", name: "Viral", count: 14, icon: "🔥" },
]

const presets = [
  {
    id: 1,
    name: "Neon Glow",
    category: "intermediate",
    difficulty: "Intermediate",
    users: "23.1k",
    likes: "4.2k",
    preview: "/neon-glow-effect-purple-pink.jpg",
    badge: "🔥 Trending",
    description: "Electric neon glow with purple-pink gradients",
    tags: ["neon", "glow", "cyberpunk"],
    creator: "NeonMaster",
    featured: true,
  },
  {
    id: 2,
    name: "Cyber Glitch",
    category: "expert",
    difficulty: "Expert",
    users: "18.7k",
    likes: "3.8k",
    preview: "/cyber-glitch-effect-blue-cyan.jpg",
    badge: "⚡ Hot",
    description: "Digital glitch with matrix-style effects",
    tags: ["glitch", "cyber", "matrix"],
    creator: "GlitchGod",
    featured: true,
  },
  {
    id: 3,
    name: "Hologram",
    category: "intermediate",
    difficulty: "Intermediate",
    users: "15.2k",
    likes: "2.9k",
    preview: "/hologram-effect-futuristic.jpg",
    badge: "✨ New",
    description: "Futuristic holographic projection effect",
    tags: ["hologram", "futuristic", "3d"],
    creator: "HoloArt",
    featured: false,
  },
  {
    id: 4,
    name: "Vaporwave",
    category: "beginner",
    difficulty: "Beginner",
    users: "12.8k",
    likes: "2.1k",
    preview: "/vaporwave-aesthetic-retro.jpg",
    badge: "🌈 Viral",
    description: "Retro 80s aesthetic with synthwave vibes",
    tags: ["vaporwave", "retro", "80s"],
    creator: "RetroWave",
    featured: false,
  },
  {
    id: 5,
    name: "Crystal Prism",
    category: "expert",
    difficulty: "Expert",
    users: "9.4k",
    likes: "1.8k",
    preview: "/crystal-prism-rainbow-refraction-effect.jpg",
    badge: "💎 Premium",
    description: "Rainbow light refraction through crystal",
    tags: ["crystal", "prism", "rainbow"],
    creator: "CrystalFX",
    featured: false,
  },
  {
    id: 6,
    name: "Fire Storm",
    category: "intermediate",
    difficulty: "Intermediate",
    users: "11.2k",
    likes: "2.3k",
    preview: "/fire-storm-flames-orange-red-effect.jpg",
    badge: "🔥 Hot",
    description: "Intense fire and flame effects",
    tags: ["fire", "flames", "storm"],
    creator: "FireMaster",
    featured: false,
  },
]

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isApplyingEffect, setIsApplyingEffect] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTryNow = (preset) => {
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
  }

  const handleApplyEffect = () => {
    setIsApplyingEffect(true)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setIsProcessing(true)
        setTimeout(() => {
          setProcessedImage(e.target.result)
          setIsProcessing(false)
        }, 2000)
      }
      reader.readAsDataURL(file)
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
    if (processedImage) {
      const link = document.createElement("a")
      link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, "-")}-effect.jpg`
      link.href = processedImage
      link.click()
    }
  }

  const handleShareResult = async () => {
    if (navigator.share && processedImage) {
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

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory = selectedCategory === "all" || preset.category === selectedCategory
    const matchesSearch =
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredPresets = presets.filter((preset) => preset.featured)

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
                      src={preset.preview || "/placeholder.svg"}
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
                        <p className="text-sm text-muted-foreground">by {preset.creator}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-border text-foreground">
                        {preset.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {preset.users}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {preset.likes}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {preset.tags.slice(0, 2).map((tag) => (
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
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-transparent border-border/30 hover:bg-card/50 text-foreground"
                }`}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
                <Badge className="ml-2 bg-secondary/30 text-white text-xs border-secondary/50">{category.count}</Badge>
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
                : categories.find((c) => c.id === selectedCategory)?.name + " Effects"}
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
                    src={preset.preview || "/placeholder.svg"}
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
                      <p className="text-xs text-muted-foreground">by {preset.creator}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 border-border text-foreground">
                      {preset.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {preset.users}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {preset.likes}
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
                <p className="text-muted-foreground">by {selectedPreset.creator}</p>
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
                      src={selectedPreset.preview || "/placeholder.svg"}
                      alt={selectedPreset.name}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <div className="flex gap-2">
                      {selectedPreset.tags.map((tag) => (
                        <Badge key={tag} className="bg-secondary/30 text-white border-secondary/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedPreset.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Difficulty</p>
                        <Badge variant="outline" className="border-border text-foreground">
                          {selectedPreset.difficulty}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <Badge className="bg-primary text-white">{selectedPreset.category}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedPreset.users} users
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {selectedPreset.likes} likes
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
                          />
                          <label htmlFor="image-upload">
                            <Button
                              className="w-full h-24 flex-col gap-2 bg-primary/20 hover:bg-primary/30 border-2 border-dashed border-primary/50"
                              asChild
                            >
                              <div className="cursor-pointer">
                                <Upload className="w-6 h-6" />
                                <span className="text-sm">Upload Photo</span>
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
                          {isProcessing ? "Applying Effect..." : "Effect Applied!"}
                        </h3>
                        <p className="text-muted-foreground">
                          {isProcessing
                            ? "Processing your image with AI magic ✨"
                            : "Your image is ready! Save or share it below."}
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
                          <h4 className="font-semibold text-center">After</h4>
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
                            ) : (
                              <img
                                src={processedImage || "/placeholder.svg"}
                                alt="Processed"
                                className="w-full h-64 object-cover rounded-xl ring-2 ring-primary/50"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {!isProcessing && processedImage && (
                        <div className="flex gap-3 justify-center">
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
                            }}
                          >
                            Try Another
                          </Button>
                        </div>
                      )}
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

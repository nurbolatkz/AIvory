"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, TrendingUp, Camera, Upload, X, Play, Heart, Download } from "lucide-react"
import Link from "next/link"

const trendingEffects = [
  {
    id: 1,
    name: "Neon Glow",
    users: "23.1k",
    badge: "🔥 Trending",
    preview: "/neon-glow-effect-purple-pink.jpg",
    category: "Glow",
  },
  {
    id: 2,
    name: "Cyber Glitch",
    users: "18.7k",
    badge: "⚡ Hot",
    preview: "/cyber-glitch-effect-blue-cyan.jpg",
    category: "Tech",
  },
  {
    id: 3,
    name: "Hologram",
    users: "15.2k",
    badge: "✨ New",
    preview: "/hologram-effect-futuristic.jpg",
    category: "Futuristic",
  },
  {
    id: 4,
    name: "Vaporwave",
    users: "12.8k",
    badge: "🌈 Viral",
    preview: "/vaporwave-aesthetic-retro.jpg",
    category: "Retro",
  },
]

export default function EffectApp() {
  const [selectedEffect, setSelectedEffect] = useState<(typeof trendingEffects)[0] | null>(null)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [showMainResult, setShowMainResult] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)

        // Stop camera stream
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
        setShowCameraModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = () => {
    if (!capturedImage || !selectedEffect) return

    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setProcessedImage(capturedImage) // In real app, this would be the processed image
      setIsProcessing(false)
      setShowResult(true)
      setShowMainResult(true)
    }, 2000)
  }

  const closeModal = () => {
    setShowCameraModal(false)
    setShowResult(false)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const startOver = () => {
    setShowCameraModal(false)
    setShowResult(false)
    setShowMainResult(false)
    setCapturedImage(null)
    setProcessedImage(null)
    setSelectedEffect(null)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const handleEffectSelect = (effect: (typeof trendingEffects)[0]) => {
    setSelectedEffect(effect)
  }

  const handleTakePhoto = () => {
    setShowCameraModal(true)
    setTimeout(startCamera, 100)
  }

  const handleSave = () => {
    if (!processedImage) return

    const link = document.createElement("a")
    link.href = processedImage
    link.download = `effectz-${selectedEffect?.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!processedImage || !selectedEffect) return

    try {
      // Convert data URL to blob
      const response = await fetch(processedImage)
      const blob = await response.blob()
      const file = new File([blob], `effectz-${selectedEffect.name}.jpg`, { type: "image/jpeg" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Check out my ${selectedEffect.name} effect!`,
          text: `Created with EFFECTZ - ${selectedEffect.name} effect`,
          files: [file],
        })
      } else {
        // Fallback: copy to clipboard or download
        await navigator.clipboard.writeText(`Check out my ${selectedEffect.name} effect created with EFFECTZ!`)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback to download
      handleSave()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border/20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-white px-3 py-1 rounded-lg bg-gradient-to-r from-primary to-secondary">
              EFFECTZ
            </span>
          </div>
          <Link href="/gallery">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
            >
              Browse All
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        <section className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Transform Your Photos</h1>
            <p className="text-muted-foreground">
              Choose an effect, capture or upload a photo, and create viral content
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleTakePhoto}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Choose Your Effect</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {trendingEffects.map((effect) => (
              <Card
                key={effect.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedEffect?.id === effect.id ? "ring-2 ring-primary bg-primary/10" : "bg-card/50 hover:bg-card/70"
                }`}
                onClick={() => handleEffectSelect(effect)}
              >
                <div className="p-3 space-y-2">
                  <div className="relative">
                    <img
                      src={effect.preview || "/placeholder.svg"}
                      alt={effect.name}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                    {selectedEffect?.id === effect.id && (
                      <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{effect.name}</h3>
                    <p className="text-xs text-muted-foreground">{effect.users} users</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {selectedEffect && !showMainResult && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedEffect.preview || "/placeholder.svg"}
                alt={selectedEffect.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{selectedEffect.name} Selected</p>
                <p className="text-sm text-muted-foreground">Now take or upload a photo to apply this effect</p>
              </div>
            </div>
          </Card>
        )}

        {showMainResult && processedImage && selectedEffect && (
          <section className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">🎉 Your Creation is Ready!</h2>
              <p className="text-muted-foreground">{selectedEffect.name} effect applied successfully</p>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <img
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed result"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-white">{selectedEffect.name}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent border-primary/30" onClick={handleSave}>
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-primary to-secondary" onClick={handleShare}>
                    <Download className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={startOver}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Create Another Effect
                </Button>
              </div>
            </Card>
          </section>
        )}
      </main>

      {showCameraModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-card/95 backdrop-blur rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {selectedEffect ? `Apply ${selectedEffect.name}` : "Select an effect first"}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!selectedEffect ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Please select an effect first</p>
                <Button onClick={closeModal} variant="outline">
                  Go Back
                </Button>
              </div>
            ) : !capturedImage ? (
              <div className="space-y-4">
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button onClick={capturePhoto} className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCapturedImage(null)} className="flex-1">
                    Retake
                  </Button>
                  <Button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Apply Effect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showResult && processedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-card/95 backdrop-blur rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">🎉 Effect Applied!</h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <img
                  src={processedImage || "/placeholder.svg"}
                  alt="Processed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSave}>
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-primary to-secondary" onClick={handleShare}>
                  <Download className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <Button variant="ghost" onClick={closeModal} className="w-full">
                View on Main Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

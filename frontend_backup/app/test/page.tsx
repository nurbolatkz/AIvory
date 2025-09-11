"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useApi } from "@/hooks/useApi"

export default function TestPage() {
  const { effects, categories, loading, error } = useApi();
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Integration Test</h1>
        
        <Button onClick={() => setShowResults(!showResults)} disabled={loading}>
          {loading ? "Loading..." : showResults ? "Hide Results" : "Show Results"}
        </Button>
        
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <h2 className="text-xl font-semibold text-red-500">Error</h2>
            <p className="mt-2">{error}</p>
          </div>
        )}
        
        {showResults && !loading && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <h2 className="text-xl font-semibold text-green-500">API Data Loaded Successfully!</h2>
              <p className="mt-2">Found {categories.length} categories and {effects.length} effects</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Categories ({categories.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <p className="text-xs mt-2">ID: {category.id}, Slug: {category.slug}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Effects ({effects.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {effects.map((effect) => (
                  <div key={effect.id} className="p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold">{effect.name}</h4>
                    <p className="text-sm text-muted-foreground">{effect.category_name}</p>
                    <p className="text-xs mt-2 line-clamp-2">{effect.user_description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{effect.badge}</span>
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">{effect.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="mt-6 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3">Loading API data...</span>
          </div>
        )}
      </div>
    </div>
  )
}
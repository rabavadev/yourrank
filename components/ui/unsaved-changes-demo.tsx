import { useState } from "react"
import { UnsavedChanges } from "@/components/ui/unsaved-changes"
import { Button } from "@/components/ui/button"

export default function DemoToolbarPage() {
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSaving(false)
    setIsSuccess(true)
    
    // Reset after delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSuccess(false)
    setHasChanges(false)
  }

  const handleSimulateError = async () => {
    setHasChanges(true)
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSaving(false)
    setIsError(true)
    
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsError(false)
  }

  return (
    <div className="container mx-auto max-w-2xl py-20 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Unsaved changes</h1>
      </div>

      {/* Demo container */}
      <div className="relative h-[300px] w-full rounded-xl border flex items-center justify-center overflow-hidden">
        
        {/* Empty content zone for illustration */}
        <div className="absolute inset-0 pointer-events-none" />

        {/* Toolbar positioned absolutely in this container */}
        <UnsavedChanges
          open={hasChanges}
          isSaving={isSaving}
          success={isSuccess}
          error={isError}
          onReset={() => setHasChanges(false)}
          onSave={handleSave}
          className="absolute bottom-32 top-auto w-fit"
          label="Unsaved changes"
        />
      </div>

      {/* Controls for the demo */}
      <div className="flex gap-2 justify-center">
        <Button variant="outline" className="cursor-pointer rounded-full" onClick={() => setHasChanges(true)}>
          Trigger changes
        </Button>
        <Button variant="outline" className="cursor-pointer rounded-full" onClick={handleSimulateError}>
          Trigger error
        </Button>
      </div>
    </div>
  )
}

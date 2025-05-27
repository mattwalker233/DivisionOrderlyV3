import { Droplet } from "lucide-react"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      <Droplet className="text-primary" />
    </div>
  )
}

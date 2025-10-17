"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Brain, Heart, DollarSign, Scale } from "lucide-react"

interface PillarFrame {
  id: number
  title: string
  description: string
  video: string
  icon: React.ReactNode
  lightColor: string
  darkColor: string
  defaultPos: { x: number; y: number; w: number; h: number }
}

interface PillarFrameComponentProps {
  pillar: PillarFrame
  width: number | string
  height: number | string
  className?: string
  isHovered: boolean
  onPillarSelect?: (pillar: string) => void
}

function PillarFrameComponent({
  pillar,
  width,
  height,
  className = "",
  isHovered,
  onPillarSelect,
}: PillarFrameComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isHovered) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }, [isHovered])

  const handleClick = () => {
    if (onPillarSelect) {
      onPillarSelect(pillar.title);
    }
  };

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{
        width,
        height,
        transition: "width 0.3s ease-in-out, height 0.3s ease-in-out",
      }}
      onClick={handleClick}
    >
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {/* Background with light color */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: pillar.lightColor }}
        />
        
        {/* Video overlay */}
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
            style={{ opacity: isHovered ? 0.8 : 0 }}
            src={pillar.video}
            loop
            muted
            playsInline
            ref={videoRef}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Icon */}
          <div 
            className="mb-4 p-4 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: pillar.darkColor,
              transform: isHovered ? "scale(1.1)" : "scale(1)"
            }}
          >
            {pillar.icon}
          </div>

          {/* Title */}
          <h3 
            className="text-xl font-bold mb-2 transition-colors duration-300"
            style={{ 
              color: pillar.darkColor,
              fontSize: isHovered ? "1.5rem" : "1.25rem"
            }}
          >
            {pillar.title}
          </h3>

          {/* Description - only show on hover */}
          <motion.p
            className="text-sm leading-relaxed transition-all duration-300"
            style={{ color: pillar.darkColor }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10
            }}
            transition={{ duration: 0.3 }}
          >
            {pillar.description}
          </motion.p>
        </div>

        {/* Hover overlay effect */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ 
            backgroundColor: pillar.darkColor,
            opacity: 0
          }}
          animate={{ 
            opacity: isHovered ? 0.1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

interface PillarsFrameLayoutProps {
  className?: string
  hoverSize?: number
  gapSize?: number
  onPillarSelect?: (pillar: string) => void
}

export function PillarsFrameLayout({ 
  className,
  hoverSize = 8,
  gapSize = 6,
  onPillarSelect
}: PillarsFrameLayoutProps) {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null)

  const pillars: PillarFrame[] = [
    {
      id: 1,
      title: "Saúde Mental",
      description: "Apoio psicológico e bem-estar emocional para uma vida mais equilibrada e feliz. Nossos especialistas oferecem terapia individual, grupos de apoio e recursos de autocuidado.",
      video: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      icon: <Brain className="w-8 h-8 text-white" />,
      lightColor: "#E0F2FE", // Light blue
      darkColor: "#0369A1", // Dark blue
      defaultPos: { x: 0, y: 0, w: 6, h: 6 }
    },
    {
      id: 2,
      title: "Bem-estar Físico",
      description: "Saúde física e qualidade de vida através de programas de exercícios, nutrição e prevenção. Promovemos hábitos saudáveis para uma vida ativa e energética.",
      video: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      icon: <Heart className="w-8 h-8 text-white" />,
      lightColor: "#FEF3C7", // Light yellow
      darkColor: "#D97706", // Dark yellow/amber
      defaultPos: { x: 6, y: 0, w: 6, h: 6 }
    },
    {
      id: 3,
      title: "Assistência Financeira",
      description: "Consultoria financeira e planejamento para estabilidade econômica. Oferecemos orientação sobre orçamento, investimentos e gestão de dívidas.",
      video: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      icon: <DollarSign className="w-8 h-8 text-white" />,
      lightColor: "#DCFCE7", // Light green
      darkColor: "#16A34A", // Dark green
      defaultPos: { x: 0, y: 6, w: 6, h: 6 }
    },
    {
      id: 4,
      title: "Assistência Jurídica",
      description: "Apoio e aconselhamento legal para proteger seus direitos. Nossa equipe jurídica oferece consultoria em diversas áreas do direito.",
      video: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      icon: <Scale className="w-8 h-8 text-white" />,
      lightColor: "#F3E8FF", // Light purple
      darkColor: "#7C3AED", // Dark purple
      defaultPos: { x: 6, y: 6, w: 6, h: 6 }
    }
  ]

  const getRowSizes = () => {
    if (hovered === null) return "6fr 6fr"
    const { row } = hovered
    const nonHoveredSize = (12 - hoverSize) / 1
    return [0, 1].map((r) => (r === row ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ")
  }

  const getColSizes = () => {
    if (hovered === null) return "6fr 6fr"
    const { col } = hovered
    const nonHoveredSize = (12 - hoverSize) / 1
    return [0, 1].map((c) => (c === col ? `${hoverSize}fr` : `${nonHoveredSize}fr`)).join(" ")
  }

  const getTransformOrigin = (x: number, y: number) => {
    const vertical = y === 0 ? "top" : "bottom"
    const horizontal = x === 0 ? "left" : "right"
    return `${vertical} ${horizontal}`
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{
        display: "grid",
        gridTemplateRows: getRowSizes(),
        gridTemplateColumns: getColSizes(),
        gap: `${gapSize}px`,
        transition: "grid-template-rows 0.4s ease, grid-template-columns 0.4s ease",
      }}
    >
      {pillars.map((pillar) => {
        const row = Math.floor(pillar.defaultPos.y / 6)
        const col = Math.floor(pillar.defaultPos.x / 6)
        const transformOrigin = getTransformOrigin(pillar.defaultPos.x, pillar.defaultPos.y)

        return (
          <motion.div
            key={pillar.id}
            className="relative"
            style={{
              transformOrigin,
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={() => setHovered({ row, col })}
            onMouseLeave={() => setHovered(null)}
          >
            <PillarFrameComponent
              pillar={pillar}
              width="100%"
              height="100%"
              className="absolute inset-0"
              isHovered={hovered?.row === row && hovered?.col === col}
              onPillarSelect={onPillarSelect}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

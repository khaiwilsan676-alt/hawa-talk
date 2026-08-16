'use client'

import React, { useEffect, useState, useRef } from 'react'

interface WhiteColorRemovalShaderProps {
  imageSrc: string
  className?: string
  style?: React.CSSProperties
}

export default function WhiteColorRemovalShader({ 
  imageSrc, 
  className = "",
  style = {}
}: WhiteColorRemovalShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      premultipliedAlpha: true,
      alpha: true 
    })
    if (!gl) {
      console.warn('WebGL not supported')
      return
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    // Fragment shader - ONLY removes white from corners and center
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
      
      // Helper function to check if point is in corner region
      bool isInCorner(vec2 point, vec2 corner, float radius) {
        float dist = distance(point, corner);
        return dist < radius;
      }
      
      // Helper function to check if point is in center region
      bool isInCenter(vec2 point, vec2 center, float radius) {
        float dist = distance(point, center);
        return dist < radius;
      }
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        
        // Define corner points (in UV coordinates)
        vec2 topLeft = vec2(0.0, 0.0);
        vec2 topRight = vec2(1.0, 0.0);
        vec2 bottomLeft = vec2(0.0, 1.0);
        vec2 bottomRight = vec2(1.0, 1.0);
        
        // Define center point
        vec2 center = vec2(0.5, 0.5);
        
        // Radii for corners and center
        float cornerRadius = 0.3; // Adjust as needed
        float centerRadius = 0.25; // Adjust as needed
        
        // Check if pixel is in any corner or center
        bool inRemovalZone = 
          isInCorner(v_texCoord, topLeft, cornerRadius) ||
          isInCorner(v_texCoord, topRight, cornerRadius) ||
          isInCorner(v_texCoord, bottomLeft, cornerRadius) ||
          isInCorner(v_texCoord, bottomRight, cornerRadius) ||
          isInCenter(v_texCoord, center, centerRadius);
        
        // Check if pixel is white/near-white
        float maxChannel = max(color.r, max(color.g, color.b));
        float minChannel = min(color.r, min(color.g, color.b));
        float difference = maxChannel - minChannel;
        bool isWhite = (minChannel >= 0.95) && (difference < 0.1);
        
        // Only remove white if in removal zone
        if (inRemovalZone && isWhite) {
          // Make white pixels fully transparent
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          // Preserve all other pixels
          gl_FragColor = color;
        }
      }
    `

    // Compile shaders
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    if (!vertexShader || !fragmentShader) return

    // Create program
    const program = gl.createProgram()
    if (!program) return
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Setup geometry
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Setup texture coordinates
    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    const texCoords = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    // Load and create texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    
    // Enable blending for transparency
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      
      // Set canvas size to match image
      canvas.width = image.width
      canvas.height = image.height
      gl.viewport(0, 0, canvas.width, canvas.height)
      
      // Clear with transparent background
      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      
      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      
      setIsLoaded(true)
    }
    image.onerror = () => {
      console.error('Failed to load image for WebGL processing')
    }
    image.src = imageSrc

    // Cleanup
    return () => {
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(texCoordBuffer)
      gl.deleteTexture(texture)
    }
  }, [imageSrc])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  )
}

import { useState, useRef, useEffect } from 'react'
import Button from './button-reusable.jsx'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera untuk selfie
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Wait for metadata to load before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.warn('Video play warning (can be ignored):', err)
          })
        }
      }
      
      setStream(mediaStream)
      setError(null)
    } catch (err) {
      console.error('Camera error:', err)
      setError('Gagal mengakses kamera. Pastikan Anda mengizinkan akses kamera.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video && canvas) {
      const context = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        setPhoto(URL.createObjectURL(blob))
        
        // Create file from blob
        const file = new File([blob], 'attendance-photo.jpg', { type: 'image/jpeg' })
        onCapture(file)
      }, 'image/jpeg', 0.95)
      
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setPhoto(null)
    startCamera()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📸 Ambil Foto Attendance
        </h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
          {!photo ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-auto"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <img src={photo} alt="Captured" className="w-full h-auto" />
          )}
        </div>

        <div className="flex gap-3">
          {!photo ? (
            <>
              <Button
                nameProp="📷 Ambil Foto"
                onClick={capturePhoto}
                variant="primary"
                disabled={!!error}
              />
              <Button
                nameProp="Batal"
                onClick={() => {
                  stopCamera()
                  onClose()
                }}
                variant="secondary"
              />
            </>
          ) : (
            <>
              <Button
                nameProp="✓ Gunakan Foto Ini"
                onClick={() => {
                  onClose()
                }}
                variant="primary"
              />
              <Button
                nameProp="🔄 Ambil Ulang"
                onClick={retakePhoto}
                variant="secondary"
              />
            </>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Pastikan wajah Anda terlihat jelas dalam foto
        </p>
      </div>
    </div>
  )
}

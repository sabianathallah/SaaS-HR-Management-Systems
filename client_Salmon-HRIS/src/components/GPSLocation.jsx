import { useState, useEffect } from 'react'

export default function GPSLocation({ onLocationCapture }) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('GPS tidak didukung oleh browser Anda')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        
        setLocation(locationData)
        setLoading(false)
        
        // Send location to parent component
        if (onLocationCapture) {
          onLocationCapture(locationData)
        }
      },
      (err) => {
        console.error('GPS error:', err)
        let errorMessage = 'Gagal mendapatkan lokasi'
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Mohon izinkan akses lokasi.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.'
            break
          case err.TIMEOUT:
            errorMessage = 'Timeout mendapatkan lokasi.'
            break
          default:
            errorMessage = 'Error tidak diketahui.'
        }
        
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-700">Mendapatkan lokasi GPS...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-700 font-semibold">❌ {error}</p>
            <p className="text-red-600 text-sm mt-1">
              Mohon aktifkan GPS dan izinkan akses lokasi
            </p>
          </div>
          <button
            onClick={getCurrentLocation}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (location) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-green-700 font-semibold mb-2">✓ Lokasi Terdeteksi</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📍 Latitude: {location.latitude.toFixed(6)}</p>
              <p>📍 Longitude: {location.longitude.toFixed(6)}</p>
              <p className="text-xs text-gray-500">
                Akurasi: ±{Math.round(location.accuracy)} meter
              </p>
            </div>
          </div>
          <button
            onClick={getCurrentLocation}
            className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        
        {/* Google Maps Preview */}
        <div className="mt-3">
          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            🗺️ Lihat di Google Maps
          </a>
        </div>
      </div>
    )
  }

  return null
}

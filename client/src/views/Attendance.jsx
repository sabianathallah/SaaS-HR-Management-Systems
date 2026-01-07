import { useState, useEffect, useRef } from 'react';
import { attendanceService } from '../services/attendanceService';
import { Camera, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    getLocation();
    fetchAttendances();
    
    return () => {
      stopCamera();
    };
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError('Failed to get location: ' + error.message);
        }
      );
    }
  };

  const fetchAttendances = async () => {
    try {
      const response = await attendanceService.getMyAttendances();
      setAttendances(response.data || []);
    } catch (err) {
      console.error('Failed to fetch attendances:', err);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const data = {
        latitude: location.latitude,
        longitude: location.longitude,
        photo,
      };

      await attendanceService.checkIn(data);
      setSuccess('Check-in successful!');
      setPhoto(null);
      setPhotoPreview(null);
      fetchAttendances();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const data = {
        latitude: location.latitude,
        longitude: location.longitude,
        photo,
      };

      await attendanceService.checkOut(data);
      setSuccess('Check-out successful!');
      setPhoto(null);
      setPhotoPreview(null);
      fetchAttendances();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Check In / Check Out</h2>

        <div className="mb-4 flex items-center gap-2 text-gray-600">
          <MapPin size={20} />
          <span>
            {location
              ? `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
              : 'Getting location...'}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo (Optional)
          </label>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={openCamera}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Camera size={20} />
              Open Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Upload Photo
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isCameraOpen && (
            <div className="mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md rounded-lg mb-2"
              />
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {photoPreview && (
            <div className="mt-2">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full max-w-md rounded-lg"
              />
              <button
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isLoading || !location}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !location}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300"
          >
            Check Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Attendance History</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(attendance.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.checkInTime || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.checkOutTime || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendances.length === 0 && (
            <p className="text-center py-4 text-gray-500">No attendance records found</p>
          )}
        </div>
      </div>
    </div>
  );
}

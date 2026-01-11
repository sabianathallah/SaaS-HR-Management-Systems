import { useState, useEffect } from 'react';
import axios from 'axios';

const OfficeLocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/office-location/admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Office Location Management</h2>
        <p className="text-gray-600">Manage office locations for GPS tracking</p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <p className="text-gray-600">Office location management features coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">Total Locations: {locations.length}</p>
      </div>
    </div>
  );
};

export default OfficeLocationManagement;

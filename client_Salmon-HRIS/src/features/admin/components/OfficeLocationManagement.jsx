import { useState, useEffect } from 'react';
import axiosInstance from '../../../shared/config/axios';
import { toast } from 'react-toastify';
import { MapPin, Plus, BarChart3, Pencil, Trash2 } from 'lucide-react';
import FormInput from '../../../shared/components/FormInput';
import FormSelect from '../../../shared/components/FormSelect';
import Modal from '../../../shared/components/Modal';

const OfficeLocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationStats, setLocationStats] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '100',
    isActive: true,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axiosInstance.get('/office-locations/admin');
      
      // Transform is_active to isActive for frontend compatibility
      const transformedData = (response.data.data || []).map(loc => ({
        ...loc,
        isActive: loc.is_active !== undefined ? loc.is_active : loc.isActive
      }));
      
      setLocations(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch office locations');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform isActive to is_active for backend
      const submitData = {
        ...formData,
        is_active: formData.isActive
      };
      
      if (editingLocation) {
        // Update existing location
        await axiosInstance.put(
          `/office-locations/admin/${editingLocation.id}`,
          submitData
        );
        alert('Office location updated successfully!');
        setShowEditModal(false);
      } else {
        // Create new location
        await axiosInstance.post('/office-locations/admin', submitData);
        alert('Office location created successfully!');
        setShowAddModal(false);
      }
      
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(error.response?.data?.message || 'Failed to save office location');
      alert(error.response?.data?.message || 'Failed to save office location');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this office location?')) return;
    
    try {
      await axiosInstance.delete(`/office-locations/admin/${id}`);
      alert('Office location deleted successfully!');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(error.response?.data?.message || 'Failed to delete office location');
      alert(error.response?.data?.message || 'Failed to delete office location');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axiosInstance.patch(`/office-locations/admin/${id}/toggle`, {});
      fetchLocations();
    } catch (error) {
      console.error('Error toggling location status:', error);
      toast.error('Failed to toggle location status');
      alert('Failed to toggle location status');
    }
  };

  const openEditModal = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      isActive: location.isActive !== undefined ? location.isActive : location.is_active,
    });
    setShowEditModal(true);
  };

  const viewStats = async (location) => {
    try {
      const response = await axiosInstance.get(`/office-locations/admin/${location.id}/stats`);
      setLocationStats(response.data.data);
      setEditingLocation(location);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch location statistics');
      alert('Failed to fetch location statistics');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      radius: '100',
      isActive: true,
    });
    setEditingLocation(null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          alert('Current location captured!');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Failed to get current location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading office locations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Office Location Management</h2>
          <p className="text-gray-600">Manage office locations for GPS-based attendance validation</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Office Location</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Locations</div>
          <div className="text-2xl font-bold text-gray-900">{locations.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Active Locations</div>
          <div className="text-2xl font-bold text-green-900">
            {locations.filter(l => l.isActive).length}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Inactive Locations</div>
          <div className="text-2xl font-bold text-gray-900">
            {locations.filter(l => !l.isActive).length}
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {locations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapPin size={40} className="mx-auto mb-2 text-gray-300" />
            <p>No office locations found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Add your first office location
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Office Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordinates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Radius</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{location.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{location.address || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{location.latitude}, {location.longitude}</div>
                      <a 
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <MapPin size={14} className="inline mr-1" /> View on Map
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.radius} meters
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(location.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          location.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {location.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => viewStats(location)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <BarChart3 size={14} className="inline mr-1" /> Stats
                      </button>
                      <button
                        onClick={() => openEditModal(location)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil size={14} className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={14} className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Office Location Modal */}
      <Modal 
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add Office Location"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Office Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Head Office, Branch A"
            required
          />
          
          <FormInput
            label="Address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full office address"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              placeholder="-6.2088"
              required
            />
            
            <FormInput
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              placeholder="106.8456"
              required
            />
          </div>
          
          <div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full mb-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MapPin size={14} className="inline mr-1" /> Use My Current Location
            </button>
            <p className="text-xs text-gray-500">Click to automatically fill coordinates from your current location</p>
          </div>
          
          <FormInput
            label="Radius (meters)"
            type="number"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
            placeholder="100"
            required
            min="10"
          />
          
          <FormSelect
            label="Status"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
          
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Location
            </button>
            <button
              type="button"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Office Location Modal */}
      <Modal 
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Office Location"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Office Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <FormInput
            label="Address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              required
            />
            
            <FormInput
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              required
            />
          </div>
          
          <div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full mb-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MapPin size={14} className="inline mr-1" /> Use My Current Location
            </button>
          </div>
          
          <FormInput
            label="Radius (meters)"
            type="number"
            value={formData.radius}
            onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
            required
            min="10"
          />
          
          <FormSelect
            label="Status"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
          
          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Update Location
            </button>
            <button
              type="button"
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Statistics Modal */}
      <Modal 
        isOpen={showStatsModal}
        onClose={() => { setShowStatsModal(false); setLocationStats(null); }}
        title={`Statistics: ${editingLocation?.name}`}
        size="lg"
      >
        {locationStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600">Total Check-ins</div>
                <div className="text-2xl font-bold text-blue-900">{locationStats.totalCheckIns || 0}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600">Valid Check-ins</div>
                <div className="text-2xl font-bold text-green-900">{locationStats.validCheckIns || 0}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-600">Outside Radius</div>
                <div className="text-2xl font-bold text-red-900">{locationStats.outsideRadius || 0}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-purple-600">Unique Users</div>
                <div className="text-2xl font-bold text-purple-900">{locationStats.uniqueUsers || 0}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Location Details</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-600">Address:</dt>
                <dd className="text-gray-900">{editingLocation?.address || '-'}</dd>
                <dt className="text-gray-600">Coordinates:</dt>
                <dd className="text-gray-900">{editingLocation?.latitude}, {editingLocation?.longitude}</dd>
                <dt className="text-gray-600">Radius:</dt>
                <dd className="text-gray-900">{editingLocation?.radius} meters</dd>
                <dt className="text-gray-600">Status:</dt>
                <dd className="text-gray-900">{editingLocation?.isActive ? 'Active' : 'Inactive'}</dd>
              </dl>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Loading statistics...</div>
        )}
      </Modal>
    </div>
  );
};

export default OfficeLocationManagement;

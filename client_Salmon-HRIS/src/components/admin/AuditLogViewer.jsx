import { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    tableName: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [pagination.page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/audit-logs?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Backend returns { data: { auditLogs: [...], pagination: {...} } }
      const auditLogs = response.data.data?.auditLogs || [];
      const paginationData = response.data.data?.pagination || {};
      
      setLogs(Array.isArray(auditLogs) ? auditLogs : []);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]); // Set to empty array on error
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/audit-logs/stats?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching audit stats:', error);
    }
  };

  const viewLogDetail = async (logId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/audit-logs/${logId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedLog(response.data.data.auditLog);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching log detail:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      userId: '',
      tableName: '',
      startDate: '',
      endDate: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('APPROVE') || action.includes('REJECT')) return 'bg-purple-100 text-purple-800';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('EXPORT')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatChanges = (changes) => {
    if (!changes) return null;
    return Object.entries(changes).map(([field, change]) => (
      <div key={field} className="text-xs mb-1">
        <span className="font-medium">{field}:</span>{' '}
        <span className="text-red-600">{JSON.stringify(change.from)}</span>
        {' → '}
        <span className="text-green-600">{JSON.stringify(change.to)}</span>
      </div>
    ));
  };

  if (loading && logs.length === 0) {
    return <div className="text-center py-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-gray-600">View system activity and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Logs</div>
          <div className="text-2xl font-bold text-blue-900">
            {stats?.total || pagination.total || logs.length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Create Actions</div>
          <div className="text-2xl font-bold text-green-900">
            {stats?.byAction?.find(a => a.action === 'CREATE')?.count || 
             logs.filter(l => l.action === 'CREATE').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Update Actions</div>
          <div className="text-2xl font-bold text-yellow-900">
            {stats?.byAction?.find(a => a.action === 'UPDATE')?.count || 
             logs.filter(l => l.action === 'UPDATE').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Delete Actions</div>
          <div className="text-2xl font-bold text-red-900">
            {stats?.byAction?.find(a => a.action === 'DELETE')?.count || 
             logs.filter(l => l.action === 'DELETE').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
            <input
              type="text"
              name="tableName"
              value={filters.tableName}
              onChange={handleFilterChange}
              placeholder="e.g., Users, Attendances"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user?.name || 'System'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.user?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.tableName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.recordId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewLogDetail(log.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total} logs)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-white border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Audit Log Detail</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID</label>
                  <div className="text-gray-900">{selectedLog.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Timestamp</label>
                  <div className="text-gray-900">
                    {new Date(selectedLog.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">User</label>
                  <div className="text-gray-900">
                    {selectedLog.user?.name || 'System'} ({selectedLog.user?.email || '-'})
                  </div>
                  <div className="text-sm text-gray-500">Role: {selectedLog.user?.role || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Action</label>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Table Name</label>
                  <div className="text-gray-900">{selectedLog.tableName || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Record ID</label>
                  <div className="text-gray-900">{selectedLog.recordId || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">IP Address</label>
                  <div className="text-gray-900 font-mono">{selectedLog.ipAddress || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">User Agent</label>
                  <div className="text-gray-900 text-sm truncate" title={selectedLog.userAgent}>
                    {selectedLog.userAgent || '-'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedLog.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-900">
                    {selectedLog.description}
                  </div>
                </div>
              )}

              {/* Changes */}
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Changes</label>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {formatChanges(selectedLog.changes)}
                  </div>
                </div>
              )}

              {/* Old Data */}
              {selectedLog.oldData && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Old Data</label>
                  <pre className="bg-red-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </div>
              )}

              {/* New Data */}
              {selectedLog.newData && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">New Data</label>
                  <pre className="bg-green-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;

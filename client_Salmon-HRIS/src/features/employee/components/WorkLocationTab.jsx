import WorkLocationRequest from './WorkLocationRequest.jsx'

export default function WorkLocationTab() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Work Location Request</h2>
        <p className="text-gray-600">Ajukan permintaan perubahan lokasi kerja sementara</p>
      </div>
      <WorkLocationRequest />
    </div>
  )
}

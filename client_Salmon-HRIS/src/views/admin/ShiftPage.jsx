import ShiftScheduleManagement from '../../components/admin/ShiftScheduleManagement';
import HybridScheduleManagement from '../../components/admin/HybridScheduleManagement';

const ShiftPage = () => {
  return (
    <div>
      <ShiftScheduleManagement />
      <div className="mt-8">
        <HybridScheduleManagement />
      </div>
    </div>
  );
};

export default ShiftPage;

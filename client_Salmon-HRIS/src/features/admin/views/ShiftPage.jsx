import ShiftScheduleManagement from '../components/ShiftScheduleManagement';
import HybridScheduleManagement from '../components/HybridScheduleManagement';

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

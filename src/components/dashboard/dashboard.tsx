import { WeightDisplayPanel } from './material-inventory';
import { ControlPanel } from './batch-control';
import { StatusPanel } from './ai-advisor';
import { ManualControlPanel } from './batch-history';

export function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Top Section */}
        <div className="col-span-12">
          <WeightDisplayPanel />
        </div>

        {/* Middle Section */}
        <div className="col-span-9">
          <ControlPanel />
        </div>
        <div className="col-span-3">
          <StatusPanel />
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <h2 className="text-lg font-semibold uppercase text-primary/80 tracking-widest mb-2">
          Manual Controls
        </h2>
        <ManualControlPanel />
      </div>
    </div>
  );
}

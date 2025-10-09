import { StatCard } from "../StatCard";
import { ClipboardCheck } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-4">
      <StatCard
        title="Total Audits"
        value="124"
        icon={ClipboardCheck}
        trend={{ value: 12, isPositive: true }}
      />
    </div>
  );
}

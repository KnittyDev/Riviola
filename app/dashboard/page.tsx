import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { UpcomingMilestones } from "@/components/dashboard/UpcomingMilestones";
import { MyPropertiesSection } from "@/components/dashboard/MyPropertiesSection";

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <PortfolioChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <UpcomingMilestones />
        </div>
        <MyPropertiesSection />
      </div>
    </div>
  );
}

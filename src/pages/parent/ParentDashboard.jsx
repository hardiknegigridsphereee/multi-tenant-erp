import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import StudentHeader from "../../components/erp/parent/StudentHeader";
import SummaryCards from "../../components/erp/parent/SummaryCards";
import PerformanceChart from "../../components/erp/parent/PerformanceChart";
import AllInsights from "../../components/erp/parent/AllInsights";
import CircularsPreview from "../../components/erp/parent/CircularsPreview";

const ParentDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">

        <StudentHeader />

        <SummaryCards />

        {/*
          Performance + AI insights + Circulars row.
          FIX: earlier attempts (Tailwind `min-[1400px]:` breakpoint, then a
          container-query breakpoint, then flexbox with fixed min-widths)
          all relied on comparing the row's width against SOME fixed pixel
          number. Any fixed number is fragile here: browser zoom changes how
          many CSS pixels fit in the window, so the exact same physical
          screen can report a different "row width" at 90% vs 100% vs 125%
          zoom, flipping across whatever threshold was chosen.

          Real fix: don't use a threshold at all for normal desktop widths.
          `grid-template-columns: 2fr 1fr 1fr` divides available space
          PROPORTIONALLY, not by a fixed pixel comparison — so it looks
          identical at every zoom level and every desktop/laptop window
          size, automatically. The row only drops to a single column via
          the 900px max-width media query below, which is a genuinely small
          width (phones / narrow tablet portrait) that a normal desktop
          window never reaches even at high zoom — so it can't misfire the
          way the earlier thresholds did.
        */}
        <div className="dashboard-row">
          <style>{`
            .dashboard-row {
              display: grid;
              grid-template-columns: 2fr 1fr 1fr;
              gap: 1rem;
            }
            @media (min-width: 640px) {
              .dashboard-row { gap: 1.5rem; }
            }
            @media (max-width: 900px) {
              .dashboard-row {
                grid-template-columns: 1fr;
              }
            }
            .dashboard-row > div {
              min-width: 0;
            }
          `}</style>

          <div className="min-h-[320px] sm:min-h-[380px]">
            <PerformanceChart />
          </div>
          <div className="min-h-[320px] sm:min-h-[380px]">
            <AllInsights />
          </div>
          <div className="min-h-[320px] sm:min-h-[380px]">
            <CircularsPreview />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
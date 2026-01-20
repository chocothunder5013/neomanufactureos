import { getDashboardStats } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"; // Import the new component

export default async function AnalyticsPage() {
  const { orderStats, totalInventoryValue, performance } = await getDashboardStats();

  // Prepare data for the client component
  const chartData = performance.map(p => ({
    name: p.taskName?.substring(0, 15) + "...",
    Estimated: p.estimatedTime,
    Actual: p.actualTime
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
      
      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated based on stock levels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed MOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {orderStats.find(s => s.state === "DONE")?._count.id || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {orderStats.find(s => s.state === "IN_PROGRESS")?._count.id || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Production Efficiency (Last 10 Jobs)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {/* Use the Client Component here */}
          <AnalyticsCharts data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
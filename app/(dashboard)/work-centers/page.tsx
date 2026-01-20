import { getWorkCenters, createWorkCenter } from "@/actions/work-centers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Plus, MapPin, DollarSign } from "lucide-react";

export default async function WorkCentersPage() {
  const centers = await getWorkCenters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Centers</h1>
          <p className="text-muted-foreground">Manage your production lines and machinery.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Work Center</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Work Center</DialogTitle></DialogHeader>
            <form action={createWorkCenter} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Center Name</Label>
                <Input name="name" placeholder="e.g. Assembly Line A" required />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input name="location" placeholder="e.g. Floor 2, Zone B" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity (Units/Hr)</Label>
                  <Input name="capacity" type="number" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label>Cost ($/Hr)</Label>
                  <Input name="costPerHour" type="number" defaultValue="20" />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Center</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centers.map((wc) => (
          <Card key={wc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {wc.name}
              </CardTitle>
              {wc.status === 'AVAILABLE' ? 
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Available</Badge> : 
                <Badge variant="destructive">Busy/Down</Badge>
              }
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4 flex items-baseline gap-1">
                 {wc._count.workOrders} <span className="text-xs font-normal text-muted-foreground">active jobs</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {wc.location || "No location"}
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4" /> Capacity: {wc.capacity} units/hr
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> ${wc.costPerHour}/hr
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
import { getWorkOrders, createWorkOrder } from "@/actions/work-orders";
import { WorkOrderListener } from "@/components/listeners/work-order-listener";
import { OrderActions } from "@/components/work-orders/order-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ClipboardList } from "lucide-react";

export default async function WorkOrdersPage() {
  const orders = await getWorkOrders();

  return (
    <div className="space-y-6">
      {/* 👂 The Invisible Listener for Real-Time Updates */}
      <WorkOrderListener />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">Manage production tasks and assignments.</p>
        </div>
        
        {/* CREATE DIALOG */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Work Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Work Order</DialogTitle>
            </DialogHeader>
            <form action={createWorkOrder} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input 
                  id="productName" 
                  name="productName" 
                  placeholder="e.g. Steel Gear" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    name="quantity" 
                    type="number" 
                    min="1" 
                    defaultValue="1" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="MEDIUM">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
              <Button type="submit" className="w-full">Create Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* DATA TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Active Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No active work orders found. Click "New Work Order" to start.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">
                      {/* FIXED: .mo instead of .manufacturingOrder */}
                      {wo.mo?.orderNo}
                    </TableCell>
                    <TableCell>{wo.mo?.product?.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          wo.status === "COMPLETED" ? "default" : 
                          wo.status === "STARTED" ? "secondary" : "outline"
                        }
                        className={
                          wo.status === "STARTED" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""
                        }
                      >
                        {wo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={wo.priority === "HIGH" ? "destructive" : "outline"}>
                        {wo.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* FIXED: .assignedTo instead of .user */}
                      {wo.assignedTo?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {wo.mo?.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <OrderActions id={wo.id} status={wo.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
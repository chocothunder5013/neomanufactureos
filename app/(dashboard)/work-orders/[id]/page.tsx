import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addComment } from "@/actions/work-orders";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OrderActions } from "@/components/work-orders/order-actions";
import { ArrowLeft, Clock, MessageSquare, Wrench } from "lucide-react";
import Link from "next/link";

export default async function WorkOrderDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await auth();

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      mo: {
        include: { product: true }
      },
      workCenter: true,
      assignedTo: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!workOrder) notFound();

  // Safe parsing of the BOM Snapshot JSON
  const bomSnapshot = workOrder.mo.bomSnapshot as any[] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/work-orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{workOrder.title}</h1>
                <Badge variant={workOrder.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {workOrder.status}
                </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
                Order #{workOrder.mo.orderNo} • {workOrder.mo.product.name}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <OrderActions id={workOrder.id} status={workOrder.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-500" />
                        Task Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Work Center</span>
                        <div className="font-semibold">
                            {workOrder.workCenter?.name || "Not Assigned"}
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                        <div className="flex items-center gap-2 mt-1">
                             <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                    {workOrder.assignedTo?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                             </Avatar>
                             <span>{workOrder.assignedTo?.name || "Unassigned"}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                        <div className="font-semibold">{workOrder.mo.quantity} units</div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Priority</span>
                         <Badge variant="outline" className="ml-2">{workOrder.priority}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>BOM Snapshot</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Material requirements locked at the time of order creation.
                    </p>
                </CardHeader>
                <CardContent>
                    {bomSnapshot.length > 0 ? (
                        <div className="space-y-2">
                            {bomSnapshot.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                    <span className="font-mono text-muted-foreground">Material ID: {item.materialId.substring(0,8)}...</span>
                                    <span className="font-bold">
                                        {(item.qtyPerUnit * workOrder.mo.quantity).toFixed(2)} units needed
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No BOM snapshot available.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN: Comments & Timeline */}
        <div className="space-y-6">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        Comments
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-2">
                        {workOrder.comments.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                No comments yet.
                            </div>
                        )}
                        {workOrder.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 text-sm">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback>{comment.author?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{comment.author?.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />
                    
                    <form action={addComment.bind(null, workOrder.id)} className="mt-auto">
                        <div className="gap-2">
                            <Textarea 
                                name="content" 
                                placeholder="Add a note or update..." 
                                className="min-h-[80px] resize-none"
                                required
                            />
                            <Button size="sm" type="submit" className="w-full mt-2">
                                Post Comment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
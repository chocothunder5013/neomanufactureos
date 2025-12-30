import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Trash2, 
  Box, 
  Layers,
  Factory,
  History 
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// FIX: params is a Promise now
export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Await the params to get the ID
  const { id } = await params;

  // 2. Fetch data using the ID
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      boms: { // Changed from 'bom' to 'boms' to match your schema
        include: {
          components: {
            include: {
              material: true // Changed from 'component' to 'material' to match schema
            }
          }
        }
      },
      stockEntries: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      manufacturingOrders: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Helper to get active BOM
  const activeBom = product.boms[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                {product.sku}
              </span>
              • {product.category || "Uncategorized"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Stats & BOM */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-blue-500" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {product.stock} <span className="text-lg text-muted-foreground font-normal">units</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Current availability in warehouse.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Adjust Stock</Button>
                <Button variant="outline" size="sm">View History</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-violet-500" />
                Bill of Materials (BOM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!activeBom ? (
                <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                  No BOM defined for this product.
                  <br />
                  <Button variant="link" className="mt-2 text-violet-600">
                    + Create BOM
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                     <span>Version: {activeBom.version}</span>
                     <Badge variant={activeBom.isActive ? "default" : "secondary"}>
                       {activeBom.isActive ? "Active" : "Archived"}
                     </Badge>
                  </div>
                  <Separator />
                  <ul className="space-y-3">
                    {activeBom.components.map((comp) => (
                      <li key={comp.id} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                          {comp.material.name}
                        </span>
                        <span className="font-mono">
                          {comp.qtyPerUnit} {comp.unit || "pcs"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History & Orders */}
        <div className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-orange-500" />
                Recent Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.manufacturingOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No recent orders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    product.manufacturingOrders.map(mo => (
                      <TableRow key={mo.id}>
                        <TableCell className="font-medium">{mo.orderNo}</TableCell>
                        <TableCell>{new Date(mo.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{mo.quantity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-500" />
                Stock Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.stockEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between text-sm border-b last:border-0 pb-3 last:pb-0">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {entry.type === "IN" ? (
                          <span className="text-green-600 font-bold">+</span>
                        ) : (
                          <span className="text-red-600 font-bold">-</span>
                        )}
                        {entry.type === "IN" ? "Stock In" : "Stock Out"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.notes || "No notes"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {Math.abs(entry.quantity)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
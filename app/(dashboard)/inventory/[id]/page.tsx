import { prisma } from "@/lib/prisma";
import { addBOMComponent, removeBOMComponent } from "@/actions/bom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Box, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      bom: {
        include: {
          components: {
            include: { component: true } // Fetch the names of raw materials
          }
        }
      },
      stockEntries: {
        orderBy: { createdAt: 'desc' },
        take: 5 // Last 5 movements
      }
    }
  });

  if (!product) notFound();

  // Fetch all other products to populate the "Add Component" dropdown
  const allProducts = await prisma.product.findMany({
    where: { 
      id: { not: product.id } // Prevent adding itself
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {product.name}
            <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-1 rounded">
              {product.sku}
            </span>
          </h1>
          <p className="text-muted-foreground">Current Stock: {product.stock} units</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: BOM (The Recipe) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" /> Bill of Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 bg-slate-50 p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Add Component</h3>
                <form action={addBOMComponent} className="flex gap-2 items-end">
                  <input type="hidden" name="parentId" value={product.id} />
                  <div className="flex-1">
                    <Select name="childId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select raw material..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input name="quantity" type="number" step="0.01" placeholder="Qty" required />
                  </div>
                  <Button type="submit">Add</Button>
                </form>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Qty / Unit</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.bom?.components.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.component.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        <form action={removeBOMComponent.bind(null, item.id, product.id)}>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!product.bom?.components.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        No components defined. This is a standalone item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" /> Recent Stock History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.stockEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{entry.type === "IN" ? "Received" : "Consumed"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={entry.type === "IN" ? "text-green-600" : "text-red-600"}>
                      {entry.type === "IN" ? "+" : "-"}{entry.quantity}
                    </div>
                  </div>
                ))}
                {!product.stockEntries.length && (
                  <div className="text-sm text-muted-foreground">No recent movement.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

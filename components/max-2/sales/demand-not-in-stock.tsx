"use client"

import { mockDemandSignals } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search } from "lucide-react"

export function DemandNotInStock() {
  const notInStock = mockDemandSignals
    .filter((d) => !d.inStock)
    .sort((a, b) => b.requestCount - a.requestCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Not in Stock</CardTitle>
        <CardDescription>Customers want these — you don&apos;t have them</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Avg Budget</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notInStock.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.vehicleDescription}</TableCell>
                <TableCell className="text-right font-semibold">{d.requestCount}</TableCell>
                <TableCell className="text-right">
                  ${d.avgBudget.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.sourceLabel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Link href="/max-2/sourcing">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Go to Sourcing
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

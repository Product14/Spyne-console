"use client"

import { mockServiceLaneOpps } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { ClipboardCheck } from "lucide-react"

export function AcquisitionPipeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service-Lane Acquisition Pipeline</CardTitle>
        <CardDescription>Customers in service with equity: appraise and acquire</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead className="text-right">RO Amount</TableHead>
              <TableHead>Visit Reason</TableHead>
              <TableHead>Buy Signal</TableHead>
              <TableHead className="text-right">Est. Equity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockServiceLaneOpps.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell className="font-medium">{opp.customerName}</TableCell>
                <TableCell className="text-xs">{opp.currentVehicle}</TableCell>
                <TableCell className="text-right">${opp.roAmount.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{opp.visitReason}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{opp.buySignal}</TableCell>
                <TableCell className="text-right font-bold text-spyne-success">
                  ${opp.estimatedEquity.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Appraise
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

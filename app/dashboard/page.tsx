'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileSpreadsheet, Check } from "lucide-react"
import Link from "next/link"
import { stateData } from "@/lib/state-data"
import { useState } from "react"
import * as XLSX from 'xlsx';
import { Checkbox } from "@/components/ui/checkbox"

// Sample division order data for demonstration
const divisionOrders = [
  {
    id: "DO-2024-001",
    operator: "Devon Energy",
    entity: "Blackrock Minerals LLC",
    wellName: "Bobcat 23-1H",
    propertyDescription: "Section 23, Block 4, 160 acres",
    royaltyInterest: "0.125",
    effectiveDate: "2024-01-15",
    state: "TX",
    status: "in_process"
  },
  {
    id: "DO-2024-002",
    operator: "Pioneer Natural Resources",
    entity: "Crown Minerals Trust",
    wellName: "Eagle Ford 14-2H",
    propertyDescription: "Section 14, Block 2, 80 acres",
    royaltyInterest: "0.1875",
    effectiveDate: "2024-01-14",
    state: "TX",
    status: "in_pay"
  },
  {
    id: "DO-2024-003",
    operator: "Occidental",
    entity: "Desert Holdings LLC",
    wellName: "Permian Vista 5-3H",
    propertyDescription: "Section 5, Block 3, 320 acres",
    royaltyInterest: "0.25",
    effectiveDate: "2024-01-13",
    state: "NM",
    status: "not_received"
  },
];

export default function DashboardPage() {
  const [selectedState, setSelectedState] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [orders, setOrders] = useState(divisionOrders);

  // Filter orders based on state, search term, and status
  const filteredOrders = orders
    .filter(order => selectedState === "all" || order.state === selectedState)
    .filter(order => selectedStatus === "all" || order.status === selectedStatus)
    .filter(order => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        order.operator.toLowerCase().includes(search) ||
        order.entity.toLowerCase().includes(search) ||
        order.wellName.toLowerCase().includes(search) ||
        order.propertyDescription.toLowerCase().includes(search) ||
        order.royaltyInterest.includes(search) ||
        order.effectiveDate.includes(search)
      );
    });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = filteredOrders.map(order => ({
      'ID': order.id,
      'Operator': order.operator,
      'Entity': order.entity,
      'Well/Property': order.wellName,
      'Property Description': order.propertyDescription,
      'Royalty Interest': order.royaltyInterest,
      'Effective Date': order.effectiveDate,
      'State': order.state
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Division Orders');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `division_orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-3xl">24</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active States</CardDescription>
            <CardTitle className="text-3xl">{stateData.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Companies</CardDescription>
            <CardTitle className="text-3xl">
              {stateData.reduce((total, state) => total + state.companies.length, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing Time</CardDescription>
            <CardTitle className="text-3xl">2.4s</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Division Orders Table with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Division Orders</CardTitle>
                <CardDescription>
                  {selectedState === "all" 
                    ? "All division orders across states" 
                    : `Division orders for ${stateData.find(s => s.code === selectedState)?.name || selectedState}`}
                </CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search division orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExportToExcel}
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedState === "all" ? "default" : "outline"}
                onClick={() => setSelectedState("all")}
                size="sm"
              >
                All States
              </Button>
              {stateData.map((state) => (
                <Button
                  key={state.code}
                  variant={selectedState === state.code ? "default" : "outline"}
                  onClick={() => setSelectedState(state.code)}
                  size="sm"
                >
                  {state.name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in_process">In Process</TabsTrigger>
              <TabsTrigger value="in_pay">In Pay</TabsTrigger>
              <TabsTrigger value="not_received">Not Received</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="rounded-md border">
                <div className="p-4">
                  <div className="grid grid-cols-8 gap-4 font-medium text-sm">
                    <div>Status</div>
                    <div>Operator</div>
                    <div>Entity</div>
                    <div>Well/Property</div>
                    <div>Property Description</div>
                    <div>Royalty Interest</div>
                    <div>Effective Date</div>
                    <div>Actions</div>
                  </div>
                </div>
                <div className="divide-y">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-8 gap-4 p-4 hover:bg-muted/50">
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="in_process">In Process</option>
                          <option value="in_pay">In Pay</option>
                          <option value="not_received">Not Received</option>
                        </select>
                      </div>
                      <div>{order.operator}</div>
                      <div>{order.entity}</div>
                      <div>{order.wellName}</div>
                      <div>{order.propertyDescription}</div>
                      <div>{order.royaltyInterest}</div>
                      <div>{order.effectiveDate}</div>
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No division orders found matching your criteria
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="in_process">
              <div className="rounded-md border">
                {/* Same table structure as "all" tab but filtered for in_process status */}
                {/* ... */}
              </div>
            </TabsContent>
            <TabsContent value="in_pay">
              <div className="rounded-md border">
                {/* Same table structure as "all" tab but filtered for in_pay status */}
                {/* ... */}
              </div>
            </TabsContent>
            <TabsContent value="not_received">
              <div className="rounded-md border">
                {/* Same table structure as "all" tab but filtered for not_received status */}
                {/* ... */}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/upload">Upload Document</Link>
        </Button>
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
            <CardDescription>Processed This Month</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Wells</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Value</CardDescription>
            <CardTitle className="text-3xl">$2.4M</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your latest division order documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Division Order #{item}</h3>
                  <p className="text-sm text-muted-foreground">Processed 2 days ago</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">254</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active States</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">All states active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+3 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4s</div>
            <p className="text-xs text-muted-foreground">Average per document</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="grid grid-cols-5 w-full max-w-[500px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="texas">Texas</TabsTrigger>
          <TabsTrigger value="new-mexico">New Mexico</TabsTrigger>
          <TabsTrigger value="oklahoma">Oklahoma</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 font-medium text-sm">
                <div>Document ID</div>
                <div>Well Name</div>
                <div>State</div>
                <div>Company</div>
                <div>Date</div>
                <div>Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {[
                {
                  id: "DO-2024-001",
                  well: "Bobcat 23-1H",
                  state: "Texas",
                  company: "Devon Energy",
                  date: "2024-01-15",
                },
                {
                  id: "DO-2024-002",
                  well: "Permian 14-2H",
                  state: "New Mexico",
                  company: "Occidental",
                  date: "2024-01-14",
                },
                {
                  id: "DO-2024-003",
                  well: "Eagle Ford 7-3H",
                  state: "Texas",
                  company: "EOG Resources",
                  date: "2024-01-13",
                },
                {
                  id: "DO-2024-004",
                  well: "Delaware 9-4H",
                  state: "New Mexico",
                  company: "Chevron",
                  date: "2024-01-12",
                },
                {
                  id: "DO-2024-005",
                  well: "SCOOP 12-5H",
                  state: "Oklahoma",
                  company: "Continental",
                  date: "2024-01-11",
                },
              ].map((order) => (
                <div key={order.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 hover:bg-muted/50">
                  <div className="font-medium">{order.id}</div>
                  <div>{order.well}</div>
                  <div>{order.state}</div>
                  <div>{order.company}</div>
                  <div>{order.date}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="texas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Texas Division Orders</CardTitle>
              <CardDescription>All division orders from Texas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">3 division orders found for Texas</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-mexico" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>New Mexico Division Orders</CardTitle>
              <CardDescription>All division orders from New Mexico</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">2 division orders found for New Mexico</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oklahoma" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Oklahoma Division Orders</CardTitle>
              <CardDescription>All division orders from Oklahoma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">1 division order found for Oklahoma</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Division Orders</CardTitle>
              <CardDescription>Your most recently processed division orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Showing last 5 processed division orders</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

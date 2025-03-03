import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertCircle,
  Calendar,
  Check,
  CreditCard,
  Download, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Tag, 
  Trash,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for payouts
const mockPayouts = [
  {
    id: "1",
    affiliate: {
      id: "a1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    amount: 6000,
    status: "paid",
    date: "2023-07-01",
    method: "Bank Transfer",
    reference: "PAY-123456",
  },
  {
    id: "2",
    affiliate: {
      id: "a2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
    amount: 4250,
    status: "paid",
    date: "2023-07-01",
    method: "PayPal",
    reference: "PAY-123457",
  },
  {
    id: "3",
    affiliate: {
      id: "a3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
    },
    amount: 2250,
    status: "pending",
    date: "2023-07-01",
    method: "Bank Transfer",
    reference: "PAY-123458",
  },
  {
    id: "4",
    affiliate: {
      id: "a4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
    },
    amount: 3500,
    status: "processing",
    date: "2023-07-01",
    method: "PayPal",
    reference: "PAY-123459",
  },
  {
    id: "5",
    affiliate: {
      id: "a5",
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
    },
    amount: 5800,
    status: "failed",
    date: "2023-07-01",
    method: "Bank Transfer",
    reference: "PAY-123460",
  },
  {
    id: "6",
    affiliate: {
      id: "a1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    amount: 4500,
    status: "paid",
    date: "2023-06-01",
    method: "Bank Transfer",
    reference: "PAY-123461",
  },
  {
    id: "7",
    affiliate: {
      id: "a2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
    amount: 3800,
    status: "paid",
    date: "2023-06-01",
    method: "PayPal",
    reference: "PAY-123462",
  },
];

export default function Payouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter payouts based on search term and status
  const filteredPayouts = mockPayouts.filter((payout) => {
    const matchesSearch =
      payout.affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || payout.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <Check className="h-4 w-4" />;
      case "pending":
        return <Calendar className="h-4 w-4" />;
      case "processing":
        return <CreditCard className="h-4 w-4" />;
      case "failed":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Calculate total amounts
  const totalPaid = filteredPayouts
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = filteredPayouts
    .filter(p => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground">
          Manage affiliate payments and track payment history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search payouts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Payout</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new affiliate payout.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="affiliate">Affiliate</Label>
                    <Select>
                      <SelectTrigger id="affiliate">
                        <SelectValue placeholder="Select affiliate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a1">John Doe</SelectItem>
                        <SelectItem value="a2">Jane Smith</SelectItem>
                        <SelectItem value="a3">Robert Johnson</SelectItem>
                        <SelectItem value="a4">Emily Davis</SelectItem>
                        <SelectItem value="a5">Michael Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="Enter amount" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Payment Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input id="reference" placeholder="Enter payment reference" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Create Payout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {statusFilter === "failed" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed Payments</AlertTitle>
            <AlertDescription>
              There are failed payments that require your attention. Please review and retry these payments.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="p-4 flex flex-row items-center">
            <div>
              <CardTitle className="text-xl">Payment History</CardTitle>
              <CardDescription>
                {filteredPayouts.length} total payouts
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payouts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="" alt={payout.affiliate.name} />
                            <AvatarFallback>
                              {payout.affiliate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Link to={`/affiliates/${payout.affiliate.id}`} className="font-medium hover:underline">
                              {payout.affiliate.name}
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              {payout.affiliate.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{payout.reference}</TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell>{new Date(payout.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(payout.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(payout.status)}
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            {payout.status === "pending" && (
                              <DropdownMenuItem>Process payment</DropdownMenuItem>
                            )}
                            {payout.status === "failed" && (
                              <DropdownMenuItem>Retry payment</DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Download receipt</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
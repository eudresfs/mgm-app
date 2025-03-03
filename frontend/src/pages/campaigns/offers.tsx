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
  Download, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Tag, 
  Trash 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for offers
const mockOffers = [
  {
    id: "1",
    name: "Premium Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    campaign: "Summer Tech Sale",
    campaignId: "1",
    status: "active",
    commission: 15, // percentage
    conversions: 85,
    revenue: 21250,
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watches",
    description: "Latest smartwatch with health tracking features",
    campaign: "Summer Tech Sale",
    campaignId: "1",
    status: "active",
    commission: 12, // percentage
    conversions: 65,
    revenue: 15600,
    category: "Electronics",
  },
  {
    id: "3",
    name: "Wireless Earbuds",
    description: "Compact wireless earbuds with long battery life",
    campaign: "Summer Tech Sale",
    campaignId: "1",
    status: "active",
    commission: 10, // percentage
    conversions: 100,
    revenue: 25000,
    category: "Electronics",
  },
  {
    id: "4",
    name: "Fitness Subscription",
    description: "Annual subscription to premium fitness content",
    campaign: "Fitness Challenge",
    campaignId: "4",
    status: "active",
    commission: 20, // percentage
    conversions: 150,
    revenue: 15000,
    category: "Health & Fitness",
  },
  {
    id: "5",
    name: "Protein Supplements",
    description: "High-quality protein supplements for fitness enthusiasts",
    campaign: "Fitness Challenge",
    campaignId: "4",
    status: "active",
    commission: 15, // percentage
    conversions: 200,
    revenue: 10000,
    category: "Health & Fitness",
  },
  {
    id: "6",
    name: "School Backpack",
    description: "Durable backpack for students",
    campaign: "Back to School",
    campaignId: "2",
    status: "active",
    commission: 10, // percentage
    conversions: 120,
    revenue: 6000,
    category: "Education",
  },
  {
    id: "7",
    name: "Laptop Discount",
    description: "Special discount on laptops for students",
    campaign: "Back to School",
    campaignId: "2",
    status: "inactive",
    commission: 8, // percentage
    conversions: 60,
    revenue: 30000,
    category: "Electronics",
  },
];

export default function Offers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get unique campaigns for filter
  const uniqueCampaigns = [...new Set(mockOffers.map(offer => offer.campaign))];

  // Filter offers based on search term, status, and campaign
  const filteredOffers = mockOffers.filter((offer) => {
    const matchesSearch =
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || offer.status === statusFilter;
    
    const matchesCampaign =
      campaignFilter === "all" || offer.campaign === campaignFilter;
    
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
        <p className="text-muted-foreground">
          Manage your affiliate offers and track their performance.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search offers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {uniqueCampaigns.map((campaign) => (
                  <SelectItem key={campaign} value={campaign}>
                    {campaign}
                  </SelectItem>
                ))}
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
                  New Offer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new affiliate offer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Offer Name</Label>
                    <Input id="name" placeholder="Enter offer name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Enter offer description" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="campaign">Campaign</Label>
                    <Select>
                      <SelectTrigger id="campaign">
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCampaigns.map((campaign) => (
                          <SelectItem key={campaign} value={campaign}>
                            {campaign}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="commission">Commission (%)</Label>
                    <Input id="commission" type="number" placeholder="Enter commission percentage" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="health">Health & Fitness</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Create Offer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 flex flex-row items-center">
            <div>
              <CardTitle className="text-xl">Affiliate Offers</CardTitle>
              <CardDescription>
                {filteredOffers.length} total offers
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No offers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link to={`/offers/${offer.id}`} className="font-medium hover:underline">
                            {offer.name}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {offer.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link to={`/campaigns/${offer.campaignId}`} className="hover:underline">
                          {offer.campaign}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(offer.status)}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{offer.commission}%</TableCell>
                      <TableCell className="text-right">{offer.conversions}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${offer.revenue.toLocaleString()}
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
                            <DropdownMenuItem>
                              <Link to={`/offers/${offer.id}`} className="flex w-full">
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit offer</DropdownMenuItem>
                            {offer.status === "active" ? (
                              <DropdownMenuItem>Deactivate offer</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>Activate offer</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete offer
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
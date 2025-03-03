import { useParams, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  LineChart 
} from "@/components/ui/chart";
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  ExternalLink, 
  Play, 
  Pause, 
  Tag, 
  Trash, 
  Users 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for a single campaign
const mockCampaign = {
  id: "1",
  name: "Summer Tech Sale",
  description: "Promote our summer tech products with special discounts",
  status: "active",
  startDate: "2023-06-01",
  endDate: "2023-08-31",
  budget: 25000,
  spent: 12500,
  conversions: 250,
  revenue: 62500,
  roi: 400, // percentage
  category: "Technology",
  tags: ["tech", "summer", "sale", "gadgets"],
  targetAudience: "Tech enthusiasts, early adopters, students",
  trackingLink: "https://example.com/aff/summer-tech?ref=",
  createdBy: "Admin User",
  createdAt: "2023-05-15",
  offers: [
    {
      id: "o1",
      name: "Premium Headphones",
      commission: 15, // percentage
      conversions: 85,
      revenue: 21250,
    },
    {
      id: "o2",
      name: "Smart Watches",
      commission: 12, // percentage
      conversions: 65,
      revenue: 15600,
    },
    {
      id: "o3",
      name: "Wireless Earbuds",
      commission: 10, // percentage
      conversions: 100,
      revenue: 25000,
    },
  ],
  affiliates: [
    {
      id: "a1",
      name: "John Doe",
      email: "john.doe@example.com",
      conversions: 120,
      earnings: 6000,
    },
    {
      id: "a2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      conversions: 85,
      earnings: 4250,
    },
    {
      id: "a3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      conversions: 45,
      earnings: 2250,
    },
  ],
};

// Mock data for charts
const performanceData = [
  { name: "Week 1", conversions: 20, revenue: 5000 },
  { name: "Week 2", conversions: 35, revenue: 8750 },
  { name: "Week 3", conversions: 45, revenue: 11250 },
  { name: "Week 4", conversions: 30, revenue: 7500 },
  { name: "Week 5", conversions: 50, revenue: 12500 },
  { name: "Week 6", conversions: 40, revenue: 10000 },
  { name: "Week 7", conversions: 30, revenue: 7500 },
];

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch the campaign data based on the ID
  // For this example, we'll just use the mock data
  const campaign = mockCampaign;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "draft":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "completed":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === "active" ? (
            <Button variant="outline" size="sm">
              <Pause className="mr-2 h-4 w-4" />
              Pause Campaign
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Activate Campaign
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.conversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${campaign.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.roi}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">{campaign.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusBadgeColor(campaign.status)}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span className="text-muted-foreground">
                  ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                </span>
              </div>
              <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round((campaign.spent / campaign.budget) * 100)}% used
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Category</p>
              <p className="text-sm">{campaign.category}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Tags</p>
              <div className="flex flex-wrap gap-1">
                {campaign.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Target Audience</p>
              <p className="text-sm">{campaign.targetAudience}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Tracking Link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted p-1 rounded">{campaign.trackingLink}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Created By</p>
              <p className="text-sm">{campaign.createdBy} on {new Date(campaign.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Weekly conversions and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={performanceData}
                index="name"
                categories={["conversions", "revenue"]}
                colors={["chart-1", "chart-2"]}
                valueFormatter={(value, category) => 
                  category === "revenue" ? `$${value}` : value.toString()
                }
                yAxisWidth={60}
                height={350}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="offers" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="offers" className="flex-1">Offers</TabsTrigger>
              <TabsTrigger value="affiliates" className="flex-1">Affiliates</TabsTrigger>
            </TabsList>
            <TabsContent value="offers" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Offers</CardTitle>
                  <CardDescription>
                    Products and services included in this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offer</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaign.offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>
                            <Link to={`/offers/${offer.id}`} className="font-medium hover:underline">
                              {offer.name}
                            </Link>
                          </TableCell>
                          <TableCell>{offer.commission}%</TableCell>
                          <TableCell className="text-right">{offer.conversions}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${offer.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="affiliates" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Affiliates</CardTitle>
                  <CardDescription>
                    Partners promoting this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaign.affiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="" alt={affiliate.name} />
                                <AvatarFallback>
                                  {affiliate.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <Link to={`/affiliates/${affiliate.id}`} className="font-medium hover:underline">
                                  {affiliate.name}
                                </Link>
                                <span className="text-sm text-muted-foreground">
                                  {affiliate.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{affiliate.conversions}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${affiliate.earnings.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
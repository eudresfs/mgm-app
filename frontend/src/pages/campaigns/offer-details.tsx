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
import { 
  BarChart, 
  LineChart 
} from "@/components/ui/chart";
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Tag, 
  Trash, 
  Users 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for a single offer
const mockOffer = {
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
  price: 250,
  trackingLink: "https://example.com/aff/headphones?ref=",
  createdAt: "2023-05-20",
  updatedAt: "2023-05-25",
  features: [
    "Active noise cancellation",
    "40-hour battery life",
    "Premium sound quality",
    "Comfortable over-ear design",
    "Bluetooth 5.0 connectivity"
  ],
  terms: [
    "Commission is paid on confirmed sales only",
    "30-day cookie duration",
    "Returns and refunds will be deducted from commissions",
    "Offer valid until campaign end date"
  ],
  topAffiliates: [
    {
      id: "a1",
      name: "John Doe",
      email: "john.doe@example.com",
      conversions: 35,
      revenue: 8750,
    },
    {
      id: "a2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      conversions: 28,
      revenue: 7000,
    },
    {
      id: "a3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      conversions: 22,
      revenue: 5500,
    },
  ],
};

// Mock data for charts
const performanceData = [
  { name: "Week 1", conversions: 8, revenue: 2000 },
  { name: "Week 2", conversions: 12, revenue: 3000 },
  { name: "Week 3", conversions: 15, revenue: 3750 },
  { name: "Week 4", conversions: 10, revenue: 2500 },
  { name: "Week 5", conversions: 18, revenue: 4500 },
  { name: "Week 6", conversions: 14, revenue: 3500 },
  { name: "Week 7", conversions: 8, revenue: 2000 },
];

export default function OfferDetails() {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch the offer data based on the ID
  // For this example, we'll just use the mock data
  const offer = mockOffer;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/offers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Offer Details</h1>
        </div>
        <div className="flex items-center gap-2">
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
            <div className="text-2xl font-bold">{offer.conversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${offer.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offer.commission}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Offer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{offer.name}</h3>
              <p className="text-sm text-muted-foreground">{offer.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusBadgeColor(offer.status)}>
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created: {new Date(offer.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Campaign</p>
              <Link to={`/campaigns/${offer.campaignId}`} className="text-sm hover:underline">
                {offer.campaign}
              </Link>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Category</p>
              <p className="text-sm">{offer.category}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm">${offer.price.toLocaleString()}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Tracking Link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted p-1 rounded">{offer.trackingLink}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Features</p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {offer.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Terms & Conditions</p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {offer.terms.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Offer Performance</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Affiliates</CardTitle>
              <CardDescription>
                Affiliates with the highest conversions for this offer
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offer.topAffiliates.map((affiliate) => (
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
                        ${affiliate.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
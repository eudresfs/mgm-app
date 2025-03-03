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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart, 
  LineChart 
} from "@/components/ui/chart";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Edit, 
  Mail, 
  MapPin, 
  Phone, 
  Tag, 
  Trash, 
  User 
} from "lucide-react";

// Mock data for a single affiliate
const mockAffiliate = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  status: "active",
  earnings: 12500,
  conversions: 250,
  joinDate: "2023-01-15",
  bio: "Experienced affiliate marketer with a focus on tech and SaaS products. Has a large following on social media and a popular blog about technology trends.",
  website: "https://johndoe-tech.com",
  socialMedia: {
    twitter: "@johndoe",
    instagram: "@johndoe_tech",
    facebook: "johndoetech",
  },
  paymentMethod: "Bank Transfer",
  paymentDetails: "XXXX-XXXX-XXXX-1234",
  campaigns: [
    {
      id: "c1",
      name: "Summer Tech Sale",
      conversions: 120,
      earnings: 6000,
      status: "active",
    },
    {
      id: "c2",
      name: "New Product Launch",
      conversions: 85,
      earnings: 4250,
      status: "active",
    },
    {
      id: "c3",
      name: "Holiday Special",
      conversions: 45,
      earnings: 2250,
      status: "completed",
    },
  ],
  payouts: [
    {
      id: "p1",
      date: "2023-07-01",
      amount: 4500,
      status: "paid",
    },
    {
      id: "p2",
      date: "2023-06-01",
      amount: 3800,
      status: "paid",
    },
    {
      id: "p3",
      date: "2023-05-01",
      amount: 4200,
      status: "paid",
    },
  ],
};

// Mock data for charts
const performanceData = [
  { name: "Jan", conversions: 20, earnings: 1000 },
  { name: "Feb", conversions: 35, earnings: 1750 },
  { name: "Mar", conversions: 45, earnings: 2250 },
  { name: "Apr", conversions: 30, earnings: 1500 },
  { name: "May", conversions: 50, earnings: 2500 },
  { name: "Jun", conversions: 40, earnings: 2000 },
  { name: "Jul", conversions: 30, earnings: 1500 },
];

export default function AffiliateDetails() {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch the affiliate data based on the ID
  // For this example, we'll just use the mock data
  const affiliate = mockAffiliate;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "pending":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "completed":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/affiliates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Details</h1>
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

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="" alt={affiliate.name} />
              <AvatarFallback className="text-2xl">
                {affiliate.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{affiliate.name}</h2>
            <Badge variant="outline" className={`mt-2 ${getStatusBadgeColor(affiliate.status)}`}>
              {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
            </Badge>
            <p className="mt-4 text-sm text-muted-foreground">{affiliate.bio}</p>
            
            <div className="mt-6 w-full space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(affiliate.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{affiliate.paymentMethod}: {affiliate.paymentDetails}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${affiliate.earnings.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{affiliate.conversions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {affiliate.campaigns.filter(c => c.status === 'active').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
              <TabsTrigger value="campaigns" className="flex-1">Campaigns</TabsTrigger>
              <TabsTrigger value="payouts" className="flex-1">Payouts</TabsTrigger>
            </TabsList>
            <TabsContent value="performance" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>
                    Conversions and earnings over the past 7 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={performanceData}
                    index="name"
                    categories={["conversions", "earnings"]}
                    colors={["chart-1", "chart-2"]}
                    valueFormatter={(value, category) => 
                      category === "earnings" ? `$${value}` : value.toString()
                    }
                    yAxisWidth={60}
                    height={350}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="campaigns" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    All campaigns this affiliate is participating in
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliate.campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <Link to={`/campaigns/${campaign.id}`} className="font-medium hover:underline">
                              {campaign.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeColor(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{campaign.conversions}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${campaign.earnings.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payouts" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Record of all payments made to this affiliate
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliate.payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            {new Date(payout.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${payout.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeColor(payout.status)}>
                              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                            </Badge>
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
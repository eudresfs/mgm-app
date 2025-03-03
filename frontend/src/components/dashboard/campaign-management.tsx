import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type CampaignStatus = "active" | "paused" | "draft";
type CampaignType = "cpa" | "cpc" | "hybrid";

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  commission: number;
  affiliates: number;
  clicks: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate?: string;
}

// Dados de exemplo para demonstração
const campaignsData: Campaign[] = [
  {
    id: "camp-001",
    name: "Campanha Verão 2024",
    type: "cpa",
    status: "active",
    commission: 10,
    affiliates: 12,
    clicks: 1450,
    conversions: 87,
    revenue: 4350.75,
    startDate: "2024-01-15",
  },
  {
    id: "camp-002",
    name: "Promoção Dia das Mães",
    type: "hybrid",
    status: "draft",
    commission: 15,
    affiliates: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    startDate: "2024-05-01",
    endDate: "2024-05-15",
  },
  {
    id: "camp-003",
    name: "Black Friday Antecipada",
    type: "cpc",
    status: "paused",
    commission: 5,
    affiliates: 8,
    clicks: 2340,
    conversions: 45,
    revenue: 2250.50,
    startDate: "2024-03-10",
    endDate: "2024-04-10",
  },
];

export function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCampaigns = campaigns.filter(
    (campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "active" && campaign.status === "active") ||
        (activeTab === "paused" && campaign.status === "paused") ||
        (activeTab === "draft" && campaign.status === "draft");
      
      return matchesSearch && matchesTab;
    }
  );

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativa</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Pausada</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Rascunho</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: CampaignType) => {
    switch (type) {
      case "cpa":
        return <Badge variant="outline">CPA</Badge>;
      case "cpc":
        return <Badge variant="outline">CPC</Badge>;
      case "hybrid":
        return <Badge variant="outline">Híbrido</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestão de Campanhas</CardTitle>
        <CardDescription>Gerencie suas campanhas de marketing de afiliados</CardDescription>
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="paused">Pausadas</TabsTrigger>
              <TabsTrigger value="draft">Rascunhos</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar campanhas..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>Nova Campanha</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Afiliados</TableHead>
              <TableHead>Cliques</TableHead>
              <TableHead>Conversões</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell>{campaign.type === "cpc" ? `R$ ${campaign.commission.toFixed(2)}` : `${campaign.commission}%`}</TableCell>
                <TableCell>{campaign.affiliates}</TableCell>
                <TableCell>{campaign.clicks}</TableCell>
                <TableCell>{campaign.conversions}</TableCell>
                <TableCell>R$ {campaign.revenue.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Detalhes</Button>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
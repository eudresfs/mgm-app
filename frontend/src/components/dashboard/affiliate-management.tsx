import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

type AffiliateStatus = "active" | "pending" | "inactive";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: AffiliateStatus;
  campaigns: number;
  conversions: number;
  revenue: number;
}

// Dados de exemplo para demonstração
const affiliatesData: Affiliate[] = [
  {
    id: "aff-001",
    name: "João Silva",
    email: "joao.silva@email.com",
    status: "active",
    campaigns: 3,
    conversions: 45,
    revenue: 1250.75,
  },
  {
    id: "aff-002",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    status: "pending",
    campaigns: 1,
    conversions: 0,
    revenue: 0,
  },
  {
    id: "aff-003",
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    status: "active",
    campaigns: 5,
    conversions: 78,
    revenue: 2340.50,
  },
  {
    id: "aff-004",
    name: "Ana Pereira",
    email: "ana.pereira@email.com",
    status: "inactive",
    campaigns: 2,
    conversions: 12,
    revenue: 450.25,
  },
];

export function AffiliateManagement() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(affiliatesData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: AffiliateStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inativo</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestão de Afiliados</CardTitle>
        <CardDescription>Gerencie seus afiliados e suas performances</CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar afiliados..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>Adicionar Afiliado</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campanhas</TableHead>
              <TableHead>Conversões</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAffiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell className="font-medium">{affiliate.name}</TableCell>
                <TableCell>{affiliate.email}</TableCell>
                <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                <TableCell>{affiliate.campaigns}</TableCell>
                <TableCell>{affiliate.conversions}</TableCell>
                <TableCell>R$ {affiliate.revenue.toFixed(2)}</TableCell>
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
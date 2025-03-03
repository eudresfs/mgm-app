import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { MetricsOverview } from "../../components/dashboard/metrics-overview";
import { CampaignManagement } from "../../components/dashboard/campaign-management";
import { AffiliateManagement } from "../../components/dashboard/affiliate-management";

export default function CompanyDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard da Empresa</h1>
        <p className="text-muted-foreground">Visão geral da sua plataforma de marketing de afiliados</p>
      </div>

      <MetricsOverview />

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-6">
          <CampaignManagement />
        </TabsContent>
        <TabsContent value="affiliates" className="mt-6">
          <AffiliateManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
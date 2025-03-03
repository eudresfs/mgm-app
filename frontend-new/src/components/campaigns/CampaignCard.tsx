import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CalendarIcon, BarChart3Icon, UsersIcon } from 'lucide-react';

export interface CampaignCardProps {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'draft' | 'completed' | 'paused';
  conversionCount: number;
  affiliateCount: number;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  id,
  name,
  description,
  startDate,
  endDate,
  status,
  conversionCount,
  affiliateCount,
  onEdit,
  onView,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {formatDate(startDate)}
              {endDate ? ` - ${formatDate(endDate)}` : ' (Sem data final)'}
            </span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{affiliateCount} afiliados</span>
          </div>
          <div className="flex items-center">
            <BarChart3Icon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{conversionCount} conversões</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onView?.(id)}>
          Ver detalhes
        </Button>
        <Button variant="default" size="sm" onClick={() => onEdit?.(id)}>
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
};
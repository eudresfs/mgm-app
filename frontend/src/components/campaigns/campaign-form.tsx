import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/utils";

const campaignFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome da campanha deve ter pelo menos 3 caracteres",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres",
  }),
  type: z.enum(["cpa", "cpc", "hybrid"], {
    required_error: "Selecione o tipo de campanha",
  }),
  commission: z.coerce.number().min(0, {
    message: "A comissão não pode ser negativa",
  }),
  startDate: z.date({
    required_error: "Selecione a data de início",
  }),
  endDate: z.date().optional(),
  hasEndDate: z.boolean().default(false),
  isActive: z.boolean().default(true),
  maxAffiliates: z.coerce.number().int().min(0).optional(),
  targetUrl: z.string().url({
    message: "Insira uma URL válida",
  }),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  initialData?: Partial<CampaignFormValues>;
  onSubmit: (data: CampaignFormValues) => void;
}

export function CampaignForm({ initialData, onSubmit }: CampaignFormProps) {
  const [hasEndDate, setHasEndDate] = useState(initialData?.hasEndDate || false);

  const defaultValues: Partial<CampaignFormValues> = {
    name: "",
    description: "",
    type: "cpa",
    commission: 10,
    startDate: new Date(),
    isActive: true,
    targetUrl: "",
    ...initialData,
  };

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  });

  function handleSubmit(data: CampaignFormValues) {
    onSubmit(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Campanha" : "Nova Campanha"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Atualize os detalhes da sua campanha"
            : "Crie uma nova campanha de marketing de afiliados"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input placeholder="Black Friday 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Campanha</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cpa">CPA (Custo por Aquisição)</SelectItem>
                        <SelectItem value="cpc">CPC (Custo por Clique)</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === "cpa" && "Comissão baseada em conversões"}
                      {field.value === "cpc" && "Comissão baseada em cliques"}
                      {field.value === "hybrid" && "Comissão mista (cliques + conversões)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da sua campanha"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("type") === "cpc" ? "Valor por Clique" : "Comissão (%)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={form.watch("type") === "cpc" ? "0.50" : "10"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("type") === "cpc"
                        ? "Valor em R$ pago por clique"
                        : "Porcentagem sobre o valor da venda"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Destino</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.seusite.com.br/pagina-produto"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL para onde os usuários serão direcionados
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Data de Término</FormLabel>
                        <FormDescription>
                          Definir uma data de término para a campanha
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setHasEndDate(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {hasEndDate && (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) =>
                                date < (form.watch("startDate") || new Date())
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status da Campanha</FormLabel>
                    <FormDescription>
                      Ativar ou desativar a campanha imediatamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
              <Button type="submit">
                {initialData ? "Atualizar Campanha" : "Criar Campanha"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Icons } from "../ui/icons";

interface TwoFactorAuthFormProps {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  method: '2fa_app' | 'sms';
  email?: string;
  phone?: string;
}

export function TwoFactorAuthForm({ onVerify, onCancel, method, email, phone }: TwoFactorAuthFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim() || code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Por favor, insira um código de verificação válido de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message || 'Código inválido. Por favor, tente novamente.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          {method === '2fa_app' 
            ? 'Digite o código do seu aplicativo autenticador'
            : `Digite o código enviado por SMS para ${phone || 'seu telefone'}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
              disabled={isLoading}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || code.length !== 6}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verificar
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Não recebeu o código?{" "}
          <Button variant="link" className="p-0" disabled={isLoading}>
            Reenviar código
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
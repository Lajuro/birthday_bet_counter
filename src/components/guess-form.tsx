'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { BirthGuess } from '@/types';
import { createGuess, updateGuess } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

const guessFormSchema = z.object({
  userName: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  guessDate: z.date({ required_error: 'Por favor selecione uma data' }),
  weight: z.coerce.number().min(0.5, { message: 'Peso deve ser maior que 0.5kg' }).max(7, { message: 'Peso deve ser menor que 7kg' }).optional(),
  height: z.coerce.number().min(30, { message: 'Altura deve ser maior que 30cm' }).max(60, { message: 'Altura deve ser menor que 60cm' }).optional(),
  comment: z.string().max(200, { message: 'Comentário deve ter no máximo 200 caracteres' }).optional(),
});

type GuessFormValues = z.infer<typeof guessFormSchema>;

interface GuessFormProps {
  initialGuess?: BirthGuess;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GuessForm({ initialGuess, onSuccess, onCancel }: GuessFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<GuessFormValues>({
    resolver: zodResolver(guessFormSchema),
    defaultValues: initialGuess 
      ? {
          userName: initialGuess.userName,
          guessDate: new Date(initialGuess.guessDate.seconds * 1000),
          weight: initialGuess.weight,
          height: initialGuess.height,
          comment: initialGuess.comment || '',
        }
      : {
          userName: '',
          comment: '',
        }
  });

  const onSubmit = async (data: GuessFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado para enviar um palpite');
      return;
    }

    setSubmitting(true);
    
    try {
      const guessData = {
        userId: user.uid,
        userName: data.userName,
        guessDate: Timestamp.fromDate(data.guessDate),
        weight: data.weight,
        height: data.height,
        comment: data.comment,
      };

      if (initialGuess) {
        // Atualizar palpite existente
        await updateGuess(initialGuess.id, guessData);
        toast.success('Palpite atualizado com sucesso!');
      } else {
        // Criar novo palpite
        const newGuess = await createGuess(guessData);
        if (!newGuess) {
          throw new Error('Erro ao criar palpite');
        }
        toast.success('Palpite registrado com sucesso!');
      }

      // Resetar formulário se for um novo palpite
      if (!initialGuess) {
        form.reset({
          userName: '',
          guessDate: undefined,
          weight: undefined,
          height: undefined,
          comment: '',
        });
      }

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao enviar palpite:', error);
      toast.error('Erro ao enviar palpite', {
        description: 'Não foi possível registrar seu palpite. Tente novamente mais tarde.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormDescription>Nome de quem está fazendo o palpite</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guessDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data e Hora do Nascimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? (
                        format(field.value, "PPpp", { locale: ptBR })
                      ) : (
                        <span>Selecione a data e hora</span>
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
                    locale={ptBR}
                  />
                  <div className="p-3 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <label htmlFor="hours" className="text-sm">Hora:</label>
                      <select 
                        id="hours"
                        className="bg-background border rounded px-2 py-1"
                        value={field.value?.getHours() || 0}
                        onChange={(e) => {
                          if (field.value) {
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(e.target.value));
                            field.onChange(newDate);
                          }
                        }}
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      
                      <span>:</span>
                      
                      <select 
                        className="bg-background border rounded px-2 py-1"
                        value={field.value?.getMinutes() || 0}
                        onChange={(e) => {
                          if (field.value) {
                            const newDate = new Date(field.value);
                            newDate.setMinutes(parseInt(e.target.value));
                            field.onChange(newDate);
                          }
                        }}
                      >
                        {Array.from({length: 60}, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Data e hora estimada para o nascimento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ex: 3.5" 
                    {...field} 
                    value={field.value || ''} 
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>Peso estimado em kg</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="Ex: 49.5" 
                    {...field} 
                    value={field.value || ''} 
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>Altura estimada em cm</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentário (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Deixe seu comentário aqui..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Limite de 200 caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : initialGuess ? 'Atualizar Palpite' : 'Registrar Palpite'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { createGuess } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Timestamp } from 'firebase/firestore';

// Esquema de validação com zod
const guessFormSchema = z.object({
  guessDate: z.date({
    required_error: "Por favor, selecione uma data para o palpite.",
  }),
  weight: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive("O peso deve ser um número positivo").min(1, "Peso mínimo: 1kg").max(10, "Peso máximo: 10kg").optional(),
  ),
  height: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive("A altura deve ser um número positivo").min(30, "Altura mínima: 30cm").max(70, "Altura máxima: 70cm").optional(),
  ),
  comment: z.string().max(200, "O comentário deve ter no máximo 200 caracteres").optional(),
});

export function BirthGuessForm() {
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof guessFormSchema>>({
    resolver: zodResolver(guessFormSchema),
    defaultValues: {
      guessDate: new Date(),
      weight: undefined,
      height: undefined,
      comment: '',
    },
  });

  async function onSubmit(values: z.infer<typeof guessFormSchema>) {
    if (!user || !userProfile) {
      toast.error("Erro ao enviar palpite", {
        description: "Você precisa estar logado para enviar um palpite.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Converter data para Timestamp do Firestore
      const guessTimestamp = Timestamp.fromDate(values.guessDate);

      // Criar objeto de palpite
      const guessData = {
        userId: user.uid,
        userName: userProfile.displayName || 'Usuário Anônimo',
        guessDate: guessTimestamp,
        weight: values.weight,
        height: values.height,
        comment: values.comment,
      };

      // Salvar palpite no Firestore
      const result = await createGuess(guessData);

      if (result) {
        toast.success("Palpite registrado com sucesso!", {
          description: "Seu palpite para o nascimento da Chloe foi registrado.",
        });
        form.reset();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao enviar seu palpite. Tente novamente.";
      toast.error("Erro ao registrar palpite", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center mb-6">Registre seu palpite</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="guessDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data e hora do nascimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPp", { locale: ptBR })
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
                      disabled={(date) => date < new Date("2024-03-01")}
                      locale={ptBR}
                    />
                    <div className="p-3 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <label htmlFor="hours" className="text-sm">Hora:</label>
                        <select 
                          id="hours"
                          className="bg-background border rounded px-2 py-1"
                          value={field.value?.getHours()}
                          onChange={(e) => {
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(e.target.value));
                            field.onChange(newDate);
                          }}
                        >
                          {Array.from({length: 24}, (_, i) => (
                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        
                        <span>:</span>
                        
                        <select 
                          className="bg-background border rounded px-2 py-1"
                          value={field.value?.getMinutes()}
                          onChange={(e) => {
                            const newDate = new Date(field.value);
                            newDate.setMinutes(parseInt(e.target.value));
                            field.onChange(newDate);
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
                  Qual é a sua previsão para o nascimento da Chloe?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
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
                      placeholder="3.5"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional
                  </FormDescription>
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
                      placeholder="48"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional
                  </FormDescription>
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
                <FormLabel>Comentário</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Deixe um comentário sobre seu palpite (opcional)"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Máximo de 200 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Registrar Palpite"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

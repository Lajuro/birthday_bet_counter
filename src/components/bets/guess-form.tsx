import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CopyIcon, CheckIcon, PhoneIcon, InfoIcon, TrophyIcon, MessageCircle } from 'lucide-react';
import { getAppSettings } from '@/lib/firebase/firestore';
import { AppSettings } from '@/types';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatPhoneNumber } from '@/lib/utils';
import { debug } from '@/lib/debug';

interface GuessFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void; // Mantido para compatibilidade com a API existente
}

export function GuessForm({ open, onOpenChange }: GuessFormProps) {
  const [pixCopied, setPixCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Buscar configurações do aplicativo
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getAppSettings();
        if (settings) {
          setAppSettings(settings);
        }
        setLoading(false);
      } catch (error) {
        debug.error('ui', 'Erro ao buscar configurações:', error);
        setLoading(false);
      }
    }
    
    if (open) {
      fetchSettings();
    }
  }, [open]);

  // Formatação da chave PIX conforme o tipo
  const formatPixKey = (key?: string, type?: string) => {
    if (!key) return '';
    
    if (type === 'celular') {
      return formatPhoneNumber(key);
    } else if (type === 'cpf') {
      return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return key;
  };

  // Verifica se o contato é o mesmo que a chave PIX
  const isContactSameAsPix = () => {
    if (!appSettings) return false;
    return appSettings.pixKeyType === 'celular' && appSettings.pixKey === appSettings.contactPhone;
  };

  // Obter contato para WhatsApp
  const getWhatsAppContact = () => {
    if (!appSettings) return '';
    
    if (isContactSameAsPix() && appSettings.pixKey) {
      return appSettings.pixKey;
    }
    
    return appSettings.contactPhone || '';
  };

  // Formatar número para URL do WhatsApp
  const formatWhatsAppUrl = (phone?: string) => {
    if (!phone) return '#';
    
    // Remover todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se o número não começar com +55 ou 55, adicionar 55 (Brasil)
    const withCountry = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    
    return `https://wa.me/${withCountry}`;
  };

  // Formatar mensagem para WhatsApp
  const getWhatsAppMessage = () => {
    const babyName = appSettings?.babyName || 'bebê';
    const guessPrice = appSettings?.guessPrice || 10;
    return encodeURIComponent(`Olá! Gostaria de fazer um palpite para o nascimento ${babyName === 'bebê' ? 'do' : 'da'} ${babyName}. Valor: R$ ${guessPrice.toFixed(2).replace('.', ',')}.`);
  };

  if (loading) {
    return null;
  }

  // Informações do PIX baseadas nas configurações
  const pixData = {
    name: appSettings?.pixName || "Patrícia Carvalho Alves",
    key: formatPixKey(appSettings?.pixKey, appSettings?.pixKeyType) || "(11) 99521-0250",
    rawKey: appSettings?.pixKey || "(11) 99521-0250",
    bank: appSettings?.pixBank || "NuBank",
    value: appSettings?.guessPrice ? appSettings.guessPrice.toFixed(2).replace('.', ',') : '10,00'
  };

  // Informações de contato
  const contactData = {
    phone: formatPhoneNumber(getWhatsAppContact()),
    rawPhone: getWhatsAppContact(),
    whatsappUrl: formatWhatsAppUrl(getWhatsAppContact()) + (getWhatsAppContact() ? `?text=${getWhatsAppMessage()}` : '')
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-full sm:max-w-[500px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Como fazer um palpite</DialogTitle>
          <DialogDescription>
            Para participar, envie uma mensagem pelo WhatsApp com seu palpite e faça o pagamento via PIX.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Passo 1 - WhatsApp */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-sm font-bold">1</div>
              <h3 className="font-medium">Envie seu palpite pelo WhatsApp</h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Entre em contato pelo WhatsApp para informar seu nome e a data do seu palpite.
              </p>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium">{contactData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(contactData.rawPhone);
                        setPhoneCopied(true);
                        setTimeout(() => setPhoneCopied(false), 2000);
                        toast.success("Número copiado para a área de transferência");
                      }}
                    >
                      {phoneCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                    <Button 
                      asChild
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
                    >
                      <a href={contactData.whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Abrir WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Passo 2 - PIX */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-sm font-bold">2</div>
              <h3 className="font-medium">Realize o pagamento via PIX</h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Faça o pagamento de R$ {pixData.value} para cada palpite que deseja fazer.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="w-32 h-32 bg-white p-2 rounded-md shadow-md flex-shrink-0">
                  <Image 
                    src="/pix_paty.png" 
                    alt="QR Code PIX" 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full bg-slate-50 dark:bg-slate-900">
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Nome</span>
                      <span className="font-medium">{pixData.name}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Banco</span>
                      <span className="font-medium">{pixData.bank}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Chave PIX</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-[120px] sm:max-w-[180px]">{pixData.key}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(pixData.rawKey);
                            setPixCopied(true);
                            setTimeout(() => setPixCopied(false), 2000);
                            toast.success("Chave PIX copiada para a área de transferência");
                          }}
                        >
                          {pixCopied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Valor por palpite</span>
                      <span className="font-medium text-green-600 dark:text-green-500">
                        R$ {pixData.value}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Passo 3 - Envio do comprovante */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-sm font-bold">3</div>
              <h3 className="font-medium">Envie o comprovante</h3>
            </div>
            
            <div className="pl-8">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Após realizar o pagamento, envie o comprovante pelo WhatsApp para confirmar seu palpite.
              </p>
            </div>
          </div>
          
          {/* Regras do prêmio */}
          <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full cursor-pointer h-auto py-1.5 px-2 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                  <InfoIcon className="h-4 w-4 text-amber-500" />
                  <span>Regras de distribuição do prêmio</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[90vw] max-w-[320px] bg-white dark:bg-slate-900 p-4 shadow-xl border border-amber-200 dark:border-amber-700/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium text-amber-800 dark:text-amber-400">Regras do Prêmio</h3>
                  </div>
                  <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold">•</span>
                      <span>Se alguém acertar <strong>sozinho</strong> a data exata do nascimento, leva <strong>todo o prêmio</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold">•</span>
                      <span>Se <strong>várias pessoas</strong> acertarem a mesma data, o prêmio será <strong>dividido igualmente</strong> entre elas.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold">•</span>
                      <span>Se <strong>ninguém acertar</strong> a data exata, o prêmio será guardado para a <strong>bebê</strong>.</span>
                    </li>
                  </ul>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            className="w-full cursor-pointer"
            onClick={() => {
              if (onOpenChange) onOpenChange(false);
            }}
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

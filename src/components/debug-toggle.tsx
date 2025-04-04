'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Bug } from 'lucide-react';
import { isDebugEnabled, toggleDebug } from '@/lib/debug';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function DebugToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Sincronizar com o estado real de debug quando o componente é montado
  useEffect(() => {
    setIsEnabled(isDebugEnabled());
  }, []);
  
  const handleToggle = () => {
    const newState = toggleDebug();
    setIsEnabled(newState);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleToggle}>
            <Badge variant={isEnabled ? "default" : "outline"} className="flex items-center gap-1 px-2 py-1">
              <Bug className="h-3.5 w-3.5" />
              <span className="text-xs">Debug</span>
            </Badge>
            <Switch 
              checked={isEnabled} 
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-purple-500"
              aria-label="Toggle debug mode"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-sm">
            {isEnabled 
              ? "Modo de depuração ativado. Os logs serão exibidos no console." 
              : "Modo de depuração desativado. Os logs estão ocultos."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

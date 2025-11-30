// RUTA: apps/web-admin/src/lib/hooks/use-visitor-data.ts
// VERSIÓN: 4.0 - Datos Climáticos Enriquecidos (WMO Codes)
// DESCRIPCIÓN: Se añade 'weathercode' a la interfaz y a la petición fetch
//              para determinar el estado del clima (Lluvia, Sol, Nubes).

'use client';

import { useState, useEffect } from 'react';

export interface VisitorData {
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  weather: {
    temperature: number;
    weathercode: number; // <-- NUEVO CAMPO PARA CÓDIGOS WMO
  };
  ip: string;
}

export function useVisitorData() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('/api/visitor');

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const jsonData = await response.json();

        if (jsonData.error) {
          throw new Error(jsonData.error);
        }

        setData(jsonData);
      } catch (err) {
        console.error("[Visitor Hook] Error recuperando datos:", err);
        setError("Datos no disponibles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorData();
  }, []);

  return { data, isLoading, error };
}

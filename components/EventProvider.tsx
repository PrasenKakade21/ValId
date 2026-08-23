"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Event } from "@/types/event";
export type Organization = {
  id: string;
  name: string;
  slug: string;
  role: string;
};


type DashboardContextType = {
  event: Event;
  org: Organization;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

type EventProviderProps = {
  event: Event;
  org: Organization;
  children: ReactNode;
};

export function EventProvider({
  event,
  org,
  children,
}: EventProviderProps) {
  return (
    <DashboardContext.Provider value={{ event, org }}>
      {children}
    </DashboardContext.Provider>
  );
}

/* =========================================================
    CUSTOM HOOKS
   ========================================================= */

// Hook to access both event and organization together
export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboardContext must be used inside an EventProvider");
  }

  return context;
}

// Convenience hook to access only the event
export function useEvent() {
  const { event } = useDashboardContext();
  return event;
}

// Convenience hook to access only the organization
export function useOrg() {
  const { org } = useDashboardContext();
  return org;
}
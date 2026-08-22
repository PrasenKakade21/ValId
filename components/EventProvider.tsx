"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

type Event = {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  status: string;
};

type EventContextType = {
  event: Event;
};

const EventContext = createContext<EventContextType | null>(null);

type EventProviderProps = {
  event: Event;
  children: ReactNode;
};

export function EventProvider({
  event,
  children,
}: EventProviderProps) {
  return (
    <EventContext.Provider value={{ event }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error(
      "useEvent must be used inside an EventProvider"
    );
  }

  return context.event;
}
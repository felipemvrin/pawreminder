export interface CalendarEventInput {
  title: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
}

export interface CalendarService {
  connect(): Promise<void>;
  createEvent(event: CalendarEventInput): Promise<{ externalId: string }>;
  disconnect(): Promise<void>;
}

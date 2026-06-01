export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
};

export async function getEvents(): Promise<CalendarEvent[]> {
  return [
    { id: 1, title: '会議', start: '10:00' },
    { id: 2, title: '開発作業', start: '13:00' },
  ];
}

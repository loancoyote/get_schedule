'use client';
// import Image from 'next/image';
import 'tailwindcss';
import LoadingSpinner from './components/loading';
import { useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<
    { id: number; title: string; start: string }[]
  >([]);

  async function getSchedule() {
    setIsLoading(true);
    const res = await fetch('/api/calendar');
    const data = await res.json();
    setIsLoading(false);
    setEvents(data.events);
  }

  return (
    <div className="py-50">
      ›
      <div className="w-100 mx-auto mb-10">
        <button
          onClick={getSchedule}
          className="block w-50 p-2 mx-auto border-2 cursor-pointer"
        >
          Get My Schedule
        </button>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id} className="text-center">
              {event.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

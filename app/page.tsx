'use client';
// import Image from 'next/image';
import 'tailwindcss';
import LoadingSpinner from './components/loading';
import { useState } from 'react';
import { CalendarEvent } from './lib/services/calendar';
import { signIn, signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  // useSessionで返ってくるdataをsessionという名前として受け取る
  const { data: session } = useSession();

  async function getSchedule() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      console.log(data.events);
      setEvents(data.events);
      setSummary(data.summary);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }

    setIsLoading(false);
  }

  return (
    <div className="py-50">
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
      ) : error ? (
        error && <p className="text-center text-red-500">{error}</p>
      ) : (
        <div>
          <ul>
            {events.map((event) => (
              <li key={event.id} className="text-center">
                {event.title ?? 'なしです'}
              </li>
            ))}
          </ul>
          <p>{summary}</p>
        </div>
      )}
      <div>
        <button onClick={() => signIn('google')}>Googleログイン</button>
      </div>
      <div>
        <button onClick={() => signOut()}>Googleログアウト</button>
      </div>
      <div>
        {session ? (
          <p>ログインしています：{session.user?.email}</p>
        ) : (
          <p>未ログインです</p>
        )}
      </div>
    </div>
  );
}

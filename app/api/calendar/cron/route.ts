import { NextRequest } from 'next/server';
import {
  fetchGoogleCalendarEvents,
  sendSlackMessage,
  summarizeCalendarEvents,
} from '../../../lib/calendarSummary';
import { refreshGoogleAccessToken } from '../../../lib/google-auth';

export async function GET(request: NextRequest) {
  // const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-vercel-cron');
  if (cronHeader !== '1') {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);

  console.log(
    'GOOGLE_CLIENT_SECRET exists:',
    !!process.env.GOOGLE_CLIENT_SECRET,
  );

  console.log(
    'GOOGLE_REFRESH_TOKEN exists:',
    !!process.env.GOOGLE_REFRESH_TOKEN,
  );

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return Response.json(
      { message: 'GOOGLE_REFRESH_TOKENが設定されていません' },
      { status: 401 },
    );
  }

  try {
    const accessToken = await refreshGoogleAccessToken(
      process.env.GOOGLE_REFRESH_TOKEN!,
    );
    const data = await fetchGoogleCalendarEvents(accessToken);
    const summary = await summarizeCalendarEvents(data);
    await sendSlackMessage(summary);
    return Response.json({ message: 'Cron実行完了' });
  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : '処理に失敗しました',
      },
      { status: 500 },
    );
  }
}

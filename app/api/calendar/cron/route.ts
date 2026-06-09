import { NextRequest } from 'next/server';
import {
  fetchGoogleCalendarEvents,
  sendSlackMessage,
  summarizeCalendarEvents,
} from '../../../lib/calendarSummary';
import { refreshGoogleAccessToken } from '../../../lib/google-auth';

export async function GET(request: NextRequest) {
  console.log('===== CRON START =====');
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('ヘッダーに関するエラーです');
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

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
    console.log('実行完了です');
    console.log('===== CRON END =====');
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

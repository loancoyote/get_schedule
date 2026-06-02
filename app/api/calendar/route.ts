import { auth } from '@/auth';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
};

// type GoogleCalendarEventRes = {
//   id: string;
//   title?: string;
//   start?: string;
// };

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ message: 'ログインが必要です' }, { status: 401 });
  }

  if (!session.accessToken) {
    return Response.json(
      { message: 'Googleのアクセストークンがありません' },
      { status: 401 },
    );
  }

  const now = new Date().toISOString();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  const url = new URL(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
  );

  url.searchParams.set('timeMin', now);
  url.searchParams.set('timeMax', threeDaysLater.toISOString());
  url.searchParams.set('maxResults', '10');
  url.searchParams.set('singleEvents', 'true');

  url.searchParams.set('orderBy', 'startTime');

  const googleRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const data = await googleRes.json();

  if (!googleRes.ok) {
    return Response.json(
      {
        message:
          data.error?.message ?? 'Google Calendar APIの取得に失敗しました',
      },
      { status: googleRes.status },
    );
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `
以下はGoogleカレンダーの予定です。
${JSON.stringify(data)}
この予定を日本語で要約してください。
      `,
      },
    ],
  });
  console.log(response);

  const summary =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const events = data.items.map((item: GoogleCalendarEvent) => ({
    id: item.id,
    title: item.summary ?? 'タイトルなし',
    start: item.start?.dateTime ?? item.start?.date ?? '',
  }));

  // const slackText =
  //   events.length > 0
  //     ? events
  //         .map(
  //           (event: GoogleCalendarEventRes) =>
  //             `・${event.title}：${event.start}`,
  //         )
  //         .join('\n')
  //     : '予定はありません';

  if (!process.env.SLACK_WEBHOOK_URL) {
    return Response.json(
      { message: 'Slack Webhook URLが設定されていません' },
      { status: 500 },
    );
  }

  const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: `今後3日間の予定\n${summary}`,
    }),
  });

  if (!slackRes.ok) {
    return Response.json(
      { message: 'Slackへの送信に失敗しました' },
      { status: 500 },
    );
  }
  // console.log(events);

  return Response.json({
    events,
    summary,
  });
}

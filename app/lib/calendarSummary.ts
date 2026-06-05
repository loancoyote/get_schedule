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

export async function fetchGoogleCalendarEvents(accessToken: string) {
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
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await googleRes.json();

  if (!googleRes.ok) {
    throw new Error(
      data.error?.message ?? 'Google Calendar APIの取得に失敗しました',
    );
  }

  return data;
}

export async function summarizeCalendarEvents(data: unknown) {
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

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export function formatCalendarEvents(data: { items?: GoogleCalendarEvent[] }) {
  return (
    data.items?.map((item) => ({
      id: item.id,
      title: item.summary ?? 'タイトルなし',
      start: item.start?.dateTime ?? item.start?.date ?? '',
    })) ?? []
  );
}

export async function sendSlackMessage(summary: string) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    throw new Error('Slack Webhook URLが設定されていません');
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
    throw new Error('Slackへの送信に失敗しました');
  }
}

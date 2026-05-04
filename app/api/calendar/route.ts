export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return Response.json({
    events: [
      { id: 1, title: '打ち合わせ', start: '10:00' },
      { id: 2, title: '開発事業', start: '13:00' },
    ],
  });
}

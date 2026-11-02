export async function POST() {
  return Response.json({ revalidated: false }, { status: 501 });
}

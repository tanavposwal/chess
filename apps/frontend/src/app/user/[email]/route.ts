import { db } from "@/db";

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  const user = await db.user.findUnique({
    where: {
      email: params.email,
    },
  });

  if (user) {
    return Response.json({ name: user.name, image: user.image });
  }
  return Response.json({
    name: "unknown",
    image:
      "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg",
  });
}

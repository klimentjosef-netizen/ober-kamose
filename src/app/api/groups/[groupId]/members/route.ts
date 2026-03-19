import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, notFound, serverError } from "@/lib/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
      include: { members: true },
    });
    if (!group) return notFound("Skupina nenalezena");

    const isMember = group.members.some((m) => m.userId === auth.userId);
    if (!isMember) return unauthorized();

    const body = await req.json();
    const { userId } = body;
    if (!userId) return badRequest("userId je povinné");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return notFound("Uživatel nenalezen");

    const alreadyMember = group.members.some((m) => m.userId === userId);
    if (alreadyMember) return badRequest("Uživatel je již členem skupiny");

    await prisma.groupMember.create({
      data: { userId, groupId: params.groupId, role: "MEMBER" },
    });

    return NextResponse.json({ success: true, username: user.username });
  } catch (err) {
    console.error("[members POST]", err);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
      include: { members: true },
    });
    if (!group) return notFound("Skupina nenalezena");

    const myMember = group.members.find((m) => m.userId === auth.userId);
    if (!myMember || myMember.role !== "OWNER") return unauthorized();

    const body = await req.json();
    const { userId } = body;
    if (!userId) return badRequest("userId je povinné");
    if (userId === auth.userId) return badRequest("Nemůžeš odebrat sám sebe");

    await prisma.groupMember.deleteMany({
      where: { userId, groupId: params.groupId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[members DELETE]", err);
    return serverError();
  }
}

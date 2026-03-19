import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, badRequest, serverError } from "@/lib/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return unauthorized();

    const body = await req.json();
    const { debtId, amount, note } = body;
    if (!debtId) return badRequest("debtId is required");

    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
      include: { from: true, to: true },
    });

    if (!debt) return badRequest("Debt not found");
    if (debt.fromId !== auth.userId && debt.toId !== auth.userId) {
      return unauthorized();
    }

    const payAmount = amount ?? debt.amount;

    await prisma.debtPayment.create({
      data: { debtId, paidById: auth.userId, amount: payAmount, note: note ?? null },
    });

    const totalPaid = await prisma.debtPayment.aggregate({
      where: { debtId },
      _sum: { amount: true },
    });

    const paidSum = totalPaid._sum.amount ?? 0;
    const newStatus = paidSum >= debt.amount ? "SETTLED" : "PARTIAL";

    await prisma.debt.update({
      where: { id: debtId },
      data: {
        status: newStatus,
        settledAt: newStatus === "SETTLED" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, status: newStatus, totalPaid: paidSum });
  } catch (err) {
    console.error("[debts/settle POST]", err);
    return serverError();
  }
}

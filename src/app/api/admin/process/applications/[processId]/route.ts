import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";
import { getApplicationsByProcessId } from "@/lib/applicationService";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Ensure requester is an admin
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    // Extract processId from request
    const { processId } = params;

    if (!processId) {
      return NextResponse.json(
        { error: "processId param is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch applications for this process
    const data = await getApplicationsByProcessId(processId);

    // ✅ Add timeline expiration checking to each application
    const now = new Date();

    const applicationsWithExpiry = data.applications.map((app: any) => {
      let hasExpiredTimeline = false;
      let expiredRoundsCount = 0;
      let activeTimeline = null;
      let timeRemaining = null;

      // Check if application has rounds
      if (!app.rounds || app.rounds.length === 0) {
        return {
          ...app,
          hasExpiredTimeline: false,
          expiredRoundsCount: 0,
          activeTimeline: null,
          timeRemaining: null,
        };
      }

      // ✅ Find current round and check timeline
      if (app.currentRoundIndex !== null && app.rounds[app.currentRoundIndex]) {
        const currentRound = app.rounds[app.currentRoundIndex];

        // Check if current round has timeline
        if (currentRound.timeline && currentRound.timelineDate) {
          activeTimeline = currentRound.timeline;

          // ✅ Convert timelineDate to Date object
          const deadlineDate = new Date(currentRound.timelineDate);

          // ✅ Check if expired
          const isExpired = deadlineDate < now;

          if (isExpired && currentRound.status !== "submitted") {
            hasExpiredTimeline = true;
            expiredRoundsCount++;
          } else if (!isExpired) {
            // ✅ Calculate time remaining
            const diff = deadlineDate.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            timeRemaining = {
              expired: false,
              days,
              hours,
              minutes,
            };
          }
        }
      }

      // ✅ Check all other rounds for expired timelines
      app.rounds.forEach((round: any, index: number) => {
        if (index === app.currentRoundIndex) return;

        if (
          round.timeline &&
          round.timelineDate &&
          round.status !== "submitted"
        ) {
          const roundDeadline = new Date(round.timelineDate);
          if (roundDeadline < now) {
            expiredRoundsCount++;
            if (!hasExpiredTimeline) {
              hasExpiredTimeline = true;
            }
          }
        }
      });

      return {
        ...app,
        hasExpiredTimeline,
        expiredRoundsCount,
        activeTimeline,
        timeRemaining,
      };
    });

    // ✅ Return enriched data with expiration info
    return NextResponse.json({
      ...data,
      applications: applicationsWithExpiry,
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

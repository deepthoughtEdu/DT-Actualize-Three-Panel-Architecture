import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";
import { getApplicationByApplicationId } from "@/lib/applicationService";
import { getProcessById } from "@/lib/processService"; // Assuming you have a service to get processes

export async function GET(
    req: NextRequest,
    { params }: { params: { applicationId: string } }
) {
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
            return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
        }

        // Extract applicationId from request
        const { applicationId } = params;
        if (!applicationId) {
            return NextResponse.json(
                { error: "applicationId param is required" },
                { status: 400 }
            );
        }

        // ✅ Fetch the application
        const application : any = await getApplicationByApplicationId(applicationId);

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Fetch process data for the given application
        const process : any = await getProcessById(application.processId);
        if (!process) {
            return NextResponse.json({ error: "Process not found" }, { status: 404 });
        }


        // Prepare rounds array based on filtered 'form' type rounds
        const roundsDetails = [];

        for (const round of application.rounds) {
            const processRound = process.rounds.find((r: any) => r._id.toString() === round.roundId.toString());

            // Only process rounds of type 'form'
            if (processRound?.type === 'form') {
                const fieldsWithAnswers = processRound.fields.map((field: any) => {
                    const answer = round.answers.find((a: any) => a.fieldId.toString() === field._id.toString());
                    return {
                        questionText: field.question,
                        answer: answer ? answer.answer : null,
                    };
                });

                // Add the round details to the response array
                roundsDetails.push({
                    roundId: round.roundId,
                    roundName: processRound.title,
                    roundStatus: round.status,
                    fields: fieldsWithAnswers,
                });
            }
        }

        // Return processed rounds data
        return NextResponse.json(roundsDetails);

    } catch (err) {
        console.error("Error fetching application details:", err);
        return NextResponse.json(
            { error: "Failed to fetch application details" },
            { status: 500 }
        );
    }
}
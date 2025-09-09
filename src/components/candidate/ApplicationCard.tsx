"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, CheckCircle, Clock, PlayCircle, PauseCircle } from "lucide-react";

export interface ApplicationData {
  id: string;
  jobTitle: string;
  role: string;
  status: "applied" | "in-progress" | "completed";
  rounds: Array<{
    name: string;
    status: "submitted" | "completed" | "in-progress" | "continue" | "pending";
    roundId: string;
    processId: string;
  }>;
}

interface ApplicationCardProps {
  application: ApplicationData;
}

const statusConfig = {
  applied: { variant: "applied" as const, text: "Applied" },
  "in-progress": { variant: "in-progress" as const, text: "In Progress" },
  completed: { variant: "completed" as const, text: "Completed" },
};

const roundStatusIcons = {
  submitted: CheckCircle,
  completed: CheckCircle,
  "in-progress": Clock,
  continue: PlayCircle,
  pending: PauseCircle,
};

const roundStatusText = {
  submitted: "Submitted",
  completed: "Completed",
  "in-progress": "In Progress",
  continue: "Continue",
  pending: "Pending",
};

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const statusInfo = statusConfig[application.status];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="h-full bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge variant={statusInfo.variant} className="mb-2">
              {statusInfo.text}
            </Badge>
            {/* <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
            >
              <Eye className="w-4 h-4" />
            </Button> */}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {application.jobTitle}
            </h3>
            <p className="text-sm text-muted-foreground">{application.role}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Rounds</h4>
              <div className="space-y-2">
                {application.rounds.map((round, index) => {
                  const Icon = roundStatusIcons[round.status];

                  // 👇 Only "continue" & "in-progress" are actionable
                  const isActionable =
                    round.status === "continue" || round.status === "in-progress";

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon
                          className={`w-4 h-4 ${
                            round.status === "completed" ||
                            round.status === "submitted"
                              ? "text-completed"
                              : round.status === "in-progress" ||
                                round.status === "continue"
                              ? "text-in-progress"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm text-foreground">
                          {round.name}
                        </span>
                      </div>

                      {isActionable ? (
                        <Link
                          href={`/candidate/processes/${round.processId}/round/${round.roundId}`}
                          className="w-fit"
                        >
                          <Button variant="continue" size="sm">
                            Continue
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {roundStatusText[round.status]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

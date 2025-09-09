"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, Briefcase } from "lucide-react";
import Link from "next/link";
import { ApplicationData } from "./ApplicationCard";

interface BrowseSectionProps {
  applications: ApplicationData[];
}

export const BrowseSection = ({ applications }: BrowseSectionProps) => {
  const total = applications.length;
  const inProgress = applications.filter((a) => a.status === "in-progress").length;
  const completed = applications.filter((a) => a.status === "completed").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Browse Opportunities Card */}
      <Card style={{ backgroundColor: 'hsla(220, 93%, 40%, 1.00)', color: 'hsl(0 0% 100%)' }} className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Browse New Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p style={{ color: 'hsl(0 0% 100% / 0.9)' }} className="text-sm">
            Discover exciting new positions that match your skills and career goals.
          </p>
          <Link href="/candidate/processes" className="block">
            <Button
              style={{
                backgroundColor: 'hsl(0 0% 100%)',
                color: 'hsl(220 60% 20%)'
              }}
              variant="secondary"
              className="w-full hover:opacity-90"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Processes
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card style={{ backgroundColor: 'hsl(220 20% 98%)', color: 'hsl(220 60% 15%)' }} className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Application Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span style={{ color: 'hsl(220 30% 45%)' }} className="text-sm">Total Applications</span>
            <span style={{ color: 'hsl(220 60% 15%)' }} className="font-semibold">{total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'hsl(220 30% 45%)' }} className="text-sm">In Progress</span>
            <span style={{ color: 'hsl(220 60% 50%)' }} className="font-semibold">{inProgress}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'hsl(220 30% 45%)' }} className="text-sm">Completed</span>
            <span style={{ color: 'hsl(140 50% 50%)' }} className="font-semibold">{completed}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

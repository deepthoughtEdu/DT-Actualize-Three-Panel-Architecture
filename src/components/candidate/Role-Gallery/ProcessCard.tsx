import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UIProcess {
  id: string;
  name: string;
  description: string;
  createdDate: string;
}

interface ProcessCardProps {
  process: UIProcess;
  onClick: (process: UIProcess) => void;
  index: number;
}

export const ProcessCard = ({ process, onClick, index }: ProcessCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        y: -8,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={() => onClick(process)}
    >
      <Card className="group h-full overflow-hidden bg-gradient-card shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="mb-[-15px]">
          <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
            {process.name}
            <motion.div
              className="text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              whileHover={{ x: 4 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-muted-foreground leading-relaxed">
            {process.description}
          </CardDescription>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {process.createdDate}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

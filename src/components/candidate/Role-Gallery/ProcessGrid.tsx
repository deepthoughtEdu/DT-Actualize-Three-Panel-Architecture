import { motion } from "framer-motion";
import { ProcessCard } from "./ProcessCard";

interface UIProcess {
  id: string;
  name: string;
  description: string;
  createdDate: string;
}

interface ProcessGridProps {
  processes: UIProcess[];
  onProcessClick: (process: UIProcess) => void;
}

export const ProcessGrid = ({ processes, onProcessClick }: ProcessGridProps) => {
  if (processes.length === 0) {
    return (
      <motion.div
        className="flex min-h-[400px] items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No hiring processes found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or check back later
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 py-12 mx-[150px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {processes.map((process, index) => (
        <ProcessCard
          key={process.id}
          process={process}
          onClick={onProcessClick}
          index={index}
        />
      ))}
    </motion.div>
  );
};

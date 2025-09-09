import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
    onSearch: (query: string) => void;
}

export const HeroSection = ({ onSearch }: HeroSectionProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    return (
        <motion.section
            style={{
                background: "linear-gradient(135deg, #0b0f85ff, #319aebff)",
                padding: "80px 24px",
                textAlign: "center",
                color: "#ffffff"
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div style={{ maxWidth: "768px", margin: "0 auto" }}>
                <motion.h1
                    style={{
                        marginBottom: "16px",
                        fontSize: "3rem",
                        fontWeight: "bold"
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Explore Hiring Processes
                </motion.h1>

                <motion.p
                    style={{
                        marginBottom: "48px",
                        fontSize: "1.25rem",
                        opacity: 0.9
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Discover exciting career opportunities and find the perfect role for your journey
                </motion.p>

                <motion.div
                    style={{ maxWidth: "512px", margin: "0 auto" }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div style={{ position: "relative" }}>
                        <Search
                            style={{
                                position: "absolute",
                                left: "16px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "20px",
                                height: "20px",
                                color: "rgba(255, 255, 255, 0.7)"
                            }}
                        />
                        <div style={{ position: "relative", width: "100%" }}>
                            <Input
                                type="text"
                                placeholder="Search hiring processes..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                style={{
                                    height: "50px",
                                    width: "100%",
                                    paddingLeft: "48px",
                                    paddingRight: "48px", // leave space for the icon
                                    fontSize: "1.125rem",
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    color:"rgba(20, 19, 19, 0.95)",
                                    backdropFilter: "blur(8px)",
                                    border: "none",
                                    borderRadius: "30px",
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                                    transition: "all 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.backgroundColor = "#ffffff";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(3, 169, 244, 0.4)";
                                    e.currentTarget.style.outline = "2px solid #03a9f4";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                                    e.currentTarget.style.outline = "none";
                                }}
                            />
                            <div style={{
                                position: "absolute",
                                right: "16px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none" // allows clicks to go through if needed
                            }}>
                                <Search size={20} color="#888" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
};

import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type NavTabItem = {
  id: number;
  tile: string;
};

export interface AnimatedNavigationTabsProps {
  items: NavTabItem[];
}

export function AnimatedNavigationTabs({ items }: AnimatedNavigationTabsProps) {
  const [active, setActive] = useState<NavTabItem>(items[0] || { id: 1, tile: "Tab" });
  const [isHover, setIsHover] = useState<NavTabItem | null>(null);

  return (
    <main className="relative w-full min-h-screen flex items-start md:items-center justify-center px-4 py-10">
      <div className="relative">
        <ul className="flex items-center justify-center list-none p-0 m-0">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "py-2 relative duration-300 transition-colors cursor-pointer hover:!text-primary bg-transparent border-0 font-medium text-sm",
                active.id === item.id ? "text-primary font-semibold" : "text-muted-foreground"
              )}
              onClick={() => setActive(item)}
              onMouseEnter={() => setIsHover(item)}
              onMouseLeave={() => setIsHover(null)}
            >
              <div className="px-5 py-2 relative z-10">
                {item.tile}
                {isHover?.id === item.id && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute bottom-0 left-0 right-0 w-full h-full bg-primary/10 -z-10"
                    style={{
                      borderRadius: 6,
                    }}
                  />
                )}
              </div>
              {active.id === item.id && (
                <motion.div
                  layoutId="active"
                  className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-primary"
                />
              )}
              {isHover?.id === item.id && (
                <motion.div
                  layoutId="hover"
                  className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default AnimatedNavigationTabs;

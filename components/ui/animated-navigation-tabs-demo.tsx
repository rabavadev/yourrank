import React from "react";
import { AnimatedNavigationTabs } from "./animated-navigation-tabs";

const ITEMS = [
  { id: 1, tile: "Overview" },
  { id: 2, tile: "Activity" },
  { id: 3, tile: "Domains" },
  { id: 4, tile: "AI" },
  { id: 5, tile: "Settings" },
];

export const AnimatedNavigationTabsDemo = () => (
  <div className="bg-background h-40 flex items-center justify-center">
    <AnimatedNavigationTabs items={ITEMS} />
  </div>
);

export default AnimatedNavigationTabsDemo;

import { createContext, useContext } from "react";

export type ScrollOrientation = "horizontal" | "vertical";

export const ScrollOrientationContext = createContext<ScrollOrientation>("vertical");

export function useScrollOrientation(): ScrollOrientation {
  return useContext(ScrollOrientationContext);
}

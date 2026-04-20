import { HTMLAttributes } from "react";
import { cn } from "./cn";

type Flavor = "text" | "title" | "avatar" | "thumb" | "card" | "list-row";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  flavor?: Flavor;
}

const base = "animate-pulse bg-paper-line/70 rounded-md";

const flavors: Record<Flavor, string> = {
  text: "h-4 w-full max-w-[16ch]",
  title: "h-6 w-2/3",
  avatar: "h-10 w-10 rounded-pill",
  thumb: "h-24 w-full rounded-lg",
  card: "h-40 w-full rounded-xl",
  "list-row": "h-12 w-full rounded-md",
};

export default function Skeleton({ flavor = "text", className, ...props }: SkeletonProps) {
  return <div aria-hidden className={cn(base, flavors[flavor], className)} {...props} />;
}

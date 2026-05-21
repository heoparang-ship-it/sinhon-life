import type { Metadata } from "next";
import { SearchScreen } from "@/components/search/SearchScreen";

export const metadata: Metadata = { title: "검색" };

export default function SearchPage() {
  return <SearchScreen />;
}

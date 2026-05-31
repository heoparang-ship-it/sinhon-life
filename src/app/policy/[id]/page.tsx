import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyDetailScreen } from "@/components/policy/PolicyDetailScreen";
import { getPolicy, listPolicyIds } from "@/lib/policy/data";

export function generateStaticParams() {
  return listPolicyIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const policy = getPolicy(id);
  if (!policy) return { title: "정책을 찾을 수 없어요" };
  return {
    title: `${policy.name} — 인천 신혼부부 정책`,
    description: `${policy.oneLiner} ${policy.target}. ${policy.amountOrRate}.`,
    alternates: { canonical: `/policy/${policy.id}` },
    openGraph: {
      title: `${policy.name} | 인천 신혼생활`,
      description: policy.oneLiner,
      url: `https://sinhon.life/policy/${policy.id}`,
    },
  };
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const policy = getPolicy(id);
  if (!policy) notFound();
  return <PolicyDetailScreen policy={policy} />;
}

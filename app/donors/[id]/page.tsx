import { notFound } from "next/navigation";
import { DONORS } from "@/lib/donors";
import DonorProfile from "@/components/DonorProfile";
export const generateStaticParams = () => DONORS.map((d) => ({ id: d.id }));
export const generateMetadata = ({ params }: { params: { id: string } }) => ({ title: `Donor ${DONORS.find((d) => d.id === params.id)?.code ?? ""}` });
export default function Page({ params }: { params: { id: string } }) {
  const d = DONORS.find((x) => x.id === params.id); if (!d) notFound();
  return <main><DonorProfile d={d} /></main>;
}

import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Log in" };
export default function Page() { return <main className="px-6 py-16"><AuthForm mode="login" /></main>; }

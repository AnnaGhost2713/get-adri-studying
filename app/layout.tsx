import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/lib/UserContext";

export const metadata: Metadata = {
	title: "Exam-Slayer",
	description: "Lernapp für WPR und Mathematik",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="de">
			<body className="bg-slate-50 text-slate-900">
				<UserProvider>
					<div className="min-h-screen flex">
						<Sidebar />
						<main className="flex-1 p-6 overflow-auto">{children}</main>
					</div>
				</UserProvider>
			</body>
		</html>
	);
}

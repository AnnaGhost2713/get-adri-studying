import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/lib/UserContext";

export const metadata: Metadata = {
	title: "Exam-Slayer",
	description: "Study app for Law and Math",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-slate-50 text-slate-900">
				<UserProvider>
					<div className="min-h-screen flex">
						<Sidebar />
						<main className="flex-1 p-6">{children}</main>
					</div>
				</UserProvider>
			</body>
		</html>
	);
}

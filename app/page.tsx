export default function HomePage() {
	return (
		<section className="space-y-4">
			<h1 className="text-3xl font-semibold">Exam-Slayer</h1>
			<p className="text-slate-600">
				Study dashboard for Business Law (Gutachtenstil) and Mathematics.
			</p>
			<div className="grid gap-4 md:grid-cols-2">
				<a className="rounded border bg-white p-4" href="/law">
					Law Module
				</a>
				<a className="rounded border bg-white p-4" href="/math">
					Math Module
				</a>
			</div>
		</section>
	);
}

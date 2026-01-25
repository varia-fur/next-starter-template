export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
			{/* Header */}
			<header className="bg-white shadow">
				<div className="max-w-6xl mx-auto px-6 py-4">
					<h1 className="text-4xl font-bold text-purple-900">
						🦋 Butterfly House
					</h1>
					<p className="text-gray-600 mt-1">Presale Ticket Management System</p>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-6 py-12">
				<div className="grid md:grid-cols-3 gap-8 mb-12">
					{/* Admin Card */}
					<div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
						<div className="text-5xl mb-4">📊</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-3">
							Admin Panel
						</h2>
						<p className="text-gray-600 mb-6">
							Manage tickets, view statistics, and monitor the system
						</p>
						<a
							href="/admin/dashboard"
							className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
						>
							Go to Dashboard →
						</a>
					</div>

					{/* Activation Scanner Card */}
					<div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
						<div className="text-5xl mb-4">✍️</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-3">
							Activation Scanner
						</h2>
						<p className="text-gray-600 mb-6">
							Scan and activate presale tickets by company
						</p>
						<a
							href="/scanner/activation"
							className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
						>
							Open Scanner →
						</a>
					</div>

					{/* Validation Scanner Card */}
					<div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
						<div className="text-5xl mb-4">✓</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-3">
							Validation Scanner
						</h2>
						<p className="text-gray-600 mb-6">
							Check ticket validity at event entry
						</p>
						<a
							href="/scanner/validation"
							className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
						>
							Open Scanner →
						</a>
					</div>
				</div>

				{/* Features Section */}
				<div className="bg-white rounded-lg shadow-lg p-8 mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-6">
						✨ System Features
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<div className="flex gap-4">
							<div className="text-2xl">🎫</div>
							<div>
								<h3 className="font-bold text-gray-900">QR Code Tickets</h3>
								<p className="text-gray-600 text-sm">
									Generate unique QR codes for each presale ticket
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="text-2xl">✍️</div>
							<div>
								<h3 className="font-bold text-gray-900">Company Activation</h3>
								<p className="text-gray-600 text-sm">
									Companies activate tickets before the event
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="text-2xl">✓</div>
							<div>
								<h3 className="font-bold text-gray-900">Entry Validation</h3>
								<p className="text-gray-600 text-sm">
									Scan and validate tickets at entry point
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="text-2xl">📊</div>
							<div>
								<h3 className="font-bold text-gray-900">Real-time Stats</h3>
								<p className="text-gray-600 text-sm">
									Live dashboard with activation and validation metrics
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="text-2xl">🛡️</div>
							<div>
								<h3 className="font-bold text-gray-900">Duplicate Prevention</h3>
								<p className="text-gray-600 text-sm">
									Tickets can only be validated once for security
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="text-2xl">☁️</div>
							<div>
								<h3 className="font-bold text-gray-900">Cloudflare Powered</h3>
								<p className="text-gray-600 text-sm">
									Built on Durable Objects for reliable persistence
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Workflow Section */}
				<div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-6">
						📋 Ticket Workflow
					</h2>
					<div className="space-y-4">
						<div className="flex items-start gap-4">
							<div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
								1
							</div>
							<div>
								<h3 className="font-bold text-gray-900">Create Tickets</h3>
								<p className="text-gray-600">
									Generate presale tickets with unique QR codes in the admin
									panel
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
								2
							</div>
							<div>
								<h3 className="font-bold text-gray-900">Distribute Tickets</h3>
								<p className="text-gray-600">
									Send QR code tickets to customers (email, print, mobile)
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
								3
							</div>
							<div>
								<h3 className="font-bold text-gray-900">Company Activates</h3>
								<p className="text-gray-600">
									Companies use the activation scanner to activate tickets
									before the event
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
								4
							</div>
							<div>
								<h3 className="font-bold text-gray-900">Entry Validation</h3>
								<p className="text-gray-600">
									Scan tickets at the event entrance to validate and allow
									entry
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-white mt-12 py-6">
				<div className="max-w-6xl mx-auto px-6 text-center">
					<p>
						🦋 Butterfly House Presale Ticket System · Powered by Next.js &
						Cloudflare
					</p>
				</div>
			</footer>
		</div>
	);
}

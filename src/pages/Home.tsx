import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { ChartBarIcon, HomeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import type { FunctionComponent } from "../common/types";

export const Home = (): FunctionComponent => {
	const { t, i18n } = useTranslation();

	const onTranslateButtonClick = async (): Promise<void> => {
		if (i18n.resolvedLanguage === "en") {
			await i18n.changeLanguage("es");
		} else {
			await i18n.changeLanguage("en");
		}
	};

	return (
		<div className="min-h-screen bg-m3-surface">
			{/* Navigation Header */}
			<header className="bg-m3-surfaceContainer border-b border-m3-outline" role="banner">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-8">
							<h1 className="text-xl font-bold text-m3-onSurface">Vite React Boilerplate</h1>
							<nav className="hidden md:flex space-x-4" role="navigation">
								<Link
									to="/"
									className="flex items-center px-3 py-2 text-m3-onSurface hover:text-m3-primary hover:bg-m3-surfaceContainerHigh rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
									activeProps={{ className: "text-m3-primary bg-m3-surfaceContainerHigh" }}
								>
									<HomeIcon className="h-5 w-5 mr-2" />
									Home
								</Link>
								<Link
									to="/analytics"
									className="flex items-center px-3 py-2 text-m3-onSurface hover:text-m3-primary hover:bg-m3-surfaceContainerHigh rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
									activeProps={{ className: "text-m3-primary bg-m3-surfaceContainerHigh" }}
								>
									<ChartBarIcon className="h-5 w-5 mr-2" />
									Analytics Dashboard
								</Link>
								<Link
									to="/csv-parser"
									className="flex items-center px-3 py-2 text-m3-onSurface hover:text-m3-primary hover:bg-m3-surfaceContainerHigh rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
									activeProps={{ className: "text-m3-primary bg-m3-surfaceContainerHigh" }}
								>
									<DocumentTextIcon className="h-5 w-5 mr-2" />
									CSV Parser
								</Link>
							</nav>
						</div>
						<button
							type="button"
							onClick={onTranslateButtonClick}
							className="bg-m3-primary text-m3-onPrimary px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
						>
							{i18n.resolvedLanguage === "en" ? "Español" : "English"}
						</button>
					</div>

					{/* Mobile Navigation */}
					<nav className="md:hidden pb-4" role="navigation">
						<div className="flex space-x-2">
							<Link
								to="/"
								className="flex items-center px-3 py-2 text-m3-onSurface hover:text-m3-primary hover:bg-m3-surfaceContainerHigh rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
								activeProps={{ className: "text-m3-primary bg-m3-surfaceContainerHigh" }}
							>
								<HomeIcon className="h-5 w-5 mr-2" />
								Home
							</Link>
							<Link
								to="/analytics"
								className="flex items-center px-3 py-2 text-m3-onSurface hover:text-m3-primary hover:bg-m3-surfaceContainerHigh rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
								activeProps={{ className: "text-m3-primary bg-m3-surfaceContainerHigh" }}
							>
								<ChartBarIcon className="h-5 w-5 mr-2" />
								Analytics
							</Link>
							<Link
								to="/csv-parser"
								className="flex items-center px-3 py-2 text-m3-onSurface hover:text-m3-primary hover:bg-m3-surfaceContainerHigh rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
								activeProps={{ className: "text-m3-primary bg-m3-surfaceContainerHigh" }}
							>
								<DocumentTextIcon className="h-5 w-5 mr-2" />
								CSV Parser
							</Link>
						</div>
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center">
					<h2 className="text-4xl font-bold text-m3-onSurface mb-4">{t("home.greeting")}</h2>
					<p className="text-xl text-m3-onSurface mb-8">
						A production-ready React boilerplate with Material 3 design system
					</p>

					{/* Feature Cards */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
						<Link
							to="/analytics"
							className="group bg-m3-surfaceContainer border border-m3-outline rounded-lg p-6 hover:bg-m3-surfaceContainerHigh transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
						>
							<ChartBarIcon className="h-12 w-12 text-m3-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
							<h3 className="text-lg font-semibold text-m3-onSurface mb-2">Analytics Dashboard</h3>
							<p className="text-m3-onSurface">
								Multi-tab interface for business analysts to analyze data across workflow steps.
							</p>
						</Link>

						<Link
							to="/csv-parser"
							className="group bg-m3-surfaceContainer border border-m3-outline rounded-lg p-6 hover:bg-m3-surfaceContainerHigh transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2"
						>
							<DocumentTextIcon className="h-12 w-12 text-m3-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
							<h3 className="text-lg font-semibold text-m3-onSurface mb-2">CSV Parser & Editor</h3>
							<p className="text-m3-onSurface">
								Multi-sheet CSV viewer with inline editing, filtering, sorting, and export capabilities.
							</p>
						</Link>

						<div className="bg-m3-surfaceContainer border border-m3-outline rounded-lg p-6">
							<div className="h-12 w-12 bg-m3-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
								<span className="text-m3-onPrimary font-bold text-lg">+</span>
							</div>
							<h3 className="text-lg font-semibold text-m3-onSurface mb-2">More Features</h3>
							<p className="text-m3-onSurface">
								Additional features and components following Material 3 design principles.
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

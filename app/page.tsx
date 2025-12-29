import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Dumbbell, LayoutDashboard, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <header className="px-6 lg:px-10 h-16 flex items-center justify-between border-b dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Progressly</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Manage your fitness business <span className="text-blue-600">all in one place.</span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              The ultimate platform for personal trainers and wellness coaches. Assign workouts, track progress, and communicate with clients seamlessly.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                  Start for free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-zinc-300 dark:border-zinc-700">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-10">
              <FeatureCard
                icon={<Users className="h-8 w-8 text-blue-600" />}
                title="Client Management"
                description="Organize all your clients in one dashboard. Track their status, plans, and progress effortlessly."
              />
              <FeatureCard
                icon={<Dumbbell className="h-8 w-8 text-blue-600" />}
                title="Workout Assignments"
                description="Create custom workout plans and assign them to clients instantly. Track sets, reps, and weights."
              />
              <FeatureCard
                icon={<LayoutDashboard className="h-8 w-8 text-blue-600" />}
                title="Progress Tracking"
                description="Visualize client progress with charts for weight, measurements, and habit adherence."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t dark:border-zinc-800 text-center text-zinc-500 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} Progressly. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 w-fit p-3 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

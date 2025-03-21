//page with a wrapper component that contains the time blocking planner, for easier styling and layout control

import TimeBlockingPlanner from "@/components/time-blocking-planner"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4">
      <TimeBlockingPlanner />
    </main>
  )
}


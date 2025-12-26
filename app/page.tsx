import DashboardClient from './components/DashboardClient';

async function getActivities() {
  // const res = await fetch('http://localhost:8000/api/activities/', {
  //   cache: 'no-store', // Always fresh data
  // });
  const res = await fetch(
    `${process.env.API_URL}/api/activities/`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function Home() {
  let activities = [];
  try {
    activities = await getActivities();
  } catch (error) {
    console.error(error);
    // Fallback to empty if backend down
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <DashboardClient initialActivities={activities} />
    </div>
  );
}
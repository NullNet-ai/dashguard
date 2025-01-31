import Map from './Map'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dynamic OpenStreetMap in Next.js</h1>
      <Map />
    </div>
  );
}

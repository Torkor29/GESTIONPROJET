export default function Chargement() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-creux" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="carte h-24" />
        ))}
      </div>
      <div className="carte h-48" />
    </div>
  );
}

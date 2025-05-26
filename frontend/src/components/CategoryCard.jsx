export default function CategoryCard({ title }) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    );
  }
  
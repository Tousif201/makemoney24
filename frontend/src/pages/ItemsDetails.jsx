import { useParams } from 'react-router-dom';

export default function ItemDetail() {
  const { id } = useParams();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <img src="https://via.placeholder.com/600x300" alt="Product" className="w-full rounded-lg"/>
      <h1 className="text-3xl font-bold mt-4">Item Title #{id}</h1>
      <p className="mt-2 text-gray-600">Detailed description of the item goes here.</p>
      <div className="mt-4 text-xl font-semibold text-blue-500">$149.00</div>
    </div>
  );
}

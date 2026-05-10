import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ListPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/procedures')
      .then(res => setRecords(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B4F8A]" />
    </div>
  );

  if (records.length === 0) return (
    <p className="text-center text-gray-500 mt-20">No records found.</p>
  );

  return (
    <div className="p-6">
      <table className="w-full border-collapse bg-white shadow rounded">
        <thead className="bg-[#1B4F8A] text-white">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{r.title}</td>
              <td className="p-3">{r.status}</td>
              <td className="p-3 space-x-2">
                <button className="text-[#1B4F8A] underline">Edit</button>
                <button className="text-red-500 underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { Search } from 'lucide-react';

const SearchFilters = ({ filters, setFilters }) => {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="card p-4 flex flex-col md:flex-row gap-3 md:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>

      <select className="input md:w-40" value={filters.status} onChange={(e) => update('status', e.target.value)}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in_review">In Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <select className="input md:w-40" value={filters.priority} onChange={(e) => update('priority', e.target.value)}>
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <input
        className="input md:w-44"
        placeholder="Category"
        value={filters.category}
        onChange={(e) => update('category', e.target.value)}
      />
    </div>
  );
};

export default SearchFilters;

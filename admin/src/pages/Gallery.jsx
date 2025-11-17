import { useEffect, useState } from 'react';
import { deleteMediaApi, listMediaApi, uploadMediaApi } from '../api/client.js';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { type: filter };
      const res = await listMediaApi(params);
      setItems(res.media || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const upload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    await uploadMediaApi(files);
    setFiles([]);
    await load();
  };

  const del = async (id) => {
    if (!confirm('Delete item?')) return;
    await deleteMediaApi(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media Gallery</h1>
        <p className="text-gray-600 mt-1">Upload and manage images/videos</p>
      </div>

      <form onSubmit={upload} className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <select className="input !w-auto" value={filter} onChange={(e)=> setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <input type="file" multiple accept="image/*,video/*" onChange={(e)=> setFiles(e.target.files)} />
          <button className="btn-primary">Upload</button>
        </div>
      </form>

      {loading ? <div>Loading…</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((m) => (
            <div key={m._id} className="card p-2 space-y-2">
              {m.type === 'image' ? (
                <img src={m.url} alt="" className="aspect-square object-cover rounded border" />
              ) : (
                <video src={m.url} controls className="aspect-square object-cover rounded border" />
              )}
              <div className="flex items-center justify-between text-xs">
                <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">Open</a>
                <button className="btn-danger !px-2 !py-1" onClick={()=> del(m._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


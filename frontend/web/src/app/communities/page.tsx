'use client';

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useCommunities } from '@/hooks/useCommunities';
import { useAuth } from '@/hooks/useAuth';
import CommunityCard from '@/components/CommunityCard';
import { communityApi } from '@/lib/api';

export default function CommunitiesPage() {
  const { communities, loading, refetch } = useCommunities();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    radiusKm: '25',
    country: '',
    region: '',
  });

  const filtered = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  async function handleJoin(id: string) {
    if (!user) { window.location.href = '/login'; return; }
    setJoining(id);
    try {
      await communityApi.join(id);
      await refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to join community');
    } finally {
      setJoining(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await communityApi.create({
        ...createForm,
        latitude: parseFloat(createForm.latitude),
        longitude: parseFloat(createForm.longitude),
        radiusKm: parseFloat(createForm.radiusKm),
      });
      await refetch();
      setShowCreate(false);
      setCreateForm({ name: '', description: '', latitude: '', longitude: '', radiusKm: '25', country: '', region: '' });
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create community');
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Communities</h1>
            <p className="text-gray-400 text-sm mt-1">Browse, join, or create a community in your area</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Community
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, region, or country..."
            className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-navy-800 border border-navy-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No communities found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Try a different search term' : 'Be the first to create a community in your area'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onJoin={handleJoin}
                showJoinButton={!!user && user.communityId !== c.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Create Community</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-lg text-danger-400 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Community Name</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Oakwood Hills Emergency Network" required
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Description</label>
                <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe your community and its purpose..." rows={3} required
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Latitude</label>
                  <input type="number" step="any" value={createForm.latitude} onChange={(e) => setCreateForm({ ...createForm, latitude: e.target.value })}
                    placeholder="37.7749" required
                    className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Longitude</label>
                  <input type="number" step="any" value={createForm.longitude} onChange={(e) => setCreateForm({ ...createForm, longitude: e.target.value })}
                    placeholder="-122.4194" required
                    className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Radius (km)</label>
                  <input type="number" step="any" min="1" value={createForm.radiusKm} onChange={(e) => setCreateForm({ ...createForm, radiusKm: e.target.value })}
                    placeholder="25" required
                    className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Region</label>
                  <input type="text" value={createForm.region} onChange={(e) => setCreateForm({ ...createForm, region: e.target.value })}
                    placeholder="California" required
                    className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1.5">Country</label>
                  <input type="text" value={createForm.country} onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                    placeholder="USA" required
                    className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              <button type="submit" disabled={createLoading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                {createLoading ? 'Creating...' : 'Create Community'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

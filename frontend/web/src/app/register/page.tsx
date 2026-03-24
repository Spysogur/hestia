'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { VulnerabilityType } from '@/lib/types';
import clsx from 'clsx';

const SKILL_OPTIONS = [
  'First Aid', 'CPR', 'Search & Rescue', 'Firefighting', 'Medical', 'Engineering',
  'Communication', 'Logistics', 'Translation', 'Mental Health', 'Construction', 'Driving',
];

const RESOURCE_OPTIONS = [
  'Truck', 'Generator', 'First Aid Kit', 'Chainsaw', 'Boat', 'ATV',
  'Tent', 'Water Purifier', 'Radio', 'Power Bank', 'Food Supplies', 'Medical Equipment',
];

const VULNERABILITY_LABELS: Record<VulnerabilityType, string> = {
  [VulnerabilityType.ELDERLY]: 'Elderly',
  [VulnerabilityType.DISABLED]: 'Disabled',
  [VulnerabilityType.NO_VEHICLE]: 'No Vehicle',
  [VulnerabilityType.MEDICAL_CONDITION]: 'Medical Condition',
  [VulnerabilityType.CHILDREN]: 'Has Children',
  [VulnerabilityType.LIMITED_MOBILITY]: 'Limited Mobility',
};

type Step = 'account' | 'profile' | 'community';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    skills: [] as string[],
    resources: [] as string[],
    vulnerabilities: [] as VulnerabilityType[],
  });

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/login?registered=1');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
      setStep('account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join Hestia</h1>
          <p className="text-gray-400 mt-1 text-sm">Build resilience with your community</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['account', 'profile', 'community'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  step === s
                    ? 'bg-orange-500 text-white'
                    : ((['account', 'profile', 'community'] as Step[]).indexOf(step) > i
                      ? 'bg-teal-500 text-white'
                      : 'bg-navy-700 text-gray-400')
                )}
              >
                {(['account', 'profile', 'community'] as Step[]).indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className={clsx('h-0.5 flex-1', i < (['account', 'profile', 'community'] as Step[]).indexOf(step) ? 'bg-teal-500' : 'bg-navy-700')} />}
            </div>
          ))}
        </div>

        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8">
          {error && (
            <div className="mb-5 p-3 bg-danger-500/10 border border-danger-500/30 rounded-lg text-danger-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 'account' && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold text-lg">Account Details</h2>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 000 0000"
                  className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="w-full bg-navy-800 border border-navy-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-orange-500"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!form.fullName || !form.email || !form.phone || !form.password) {
                    setError('Please fill in all fields');
                    return;
                  }
                  setError('');
                  setStep('profile');
                }}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Skills & Resources */}
          {step === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-white font-semibold text-lg">Skills & Resources</h2>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Your Skills <span className="text-gray-500">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setForm({ ...form, skills: toggle(form.skills, skill) })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        form.skills.includes(skill)
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                          : 'bg-navy-800 border-navy-600 text-gray-400 hover:border-navy-500 hover:text-gray-300'
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Resources Available <span className="text-gray-500">(what you can offer)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_OPTIONS.map((resource) => (
                    <button
                      key={resource}
                      type="button"
                      onClick={() => setForm({ ...form, resources: toggle(form.resources, resource) })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                        form.resources.includes(resource)
                          ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                          : 'bg-navy-800 border-navy-600 text-gray-400 hover:border-navy-500 hover:text-gray-300'
                      )}
                    >
                      {resource}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('account')}
                  className="flex-1 py-3 bg-navy-800 hover:bg-navy-700 border border-navy-600 text-gray-300 font-semibold rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('community')}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Vulnerabilities */}
          {step === 'community' && (
            <div className="space-y-6">
              <h2 className="text-white font-semibold text-lg">Vulnerability Info</h2>
              <p className="text-gray-400 text-sm">
                This helps coordinators prioritize assistance. This information is only visible to community coordinators.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(VULNERABILITY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        vulnerabilities: toggle(form.vulnerabilities, key as VulnerabilityType),
                      })
                    }
                    className={clsx(
                      'px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all',
                      form.vulnerabilities.includes(key as VulnerabilityType)
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-navy-800 border-navy-600 text-gray-400 hover:border-navy-500 hover:text-gray-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-xs">
                None selected means you don't have specific vulnerabilities and may be available to help others.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('profile')}
                  className="flex-1 py-3 bg-navy-800 hover:bg-navy-700 border border-navy-600 text-gray-300 font-semibold rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

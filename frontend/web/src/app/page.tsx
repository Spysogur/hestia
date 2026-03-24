import Link from 'next/link';
import { AlertTriangle, Users, Map, Zap, Shield, Heart, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            Community Emergency Response System
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            When it matters most,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              your community responds.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hestia connects neighbors during emergencies — real-time alerts, help request matching,
            and coordinated response when every second counts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/25 text-lg"
            >
              Join Your Community
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-600 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg"
            >
              <Map className="w-5 h-5" />
              View Live Map
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '24/7', label: 'Real-time alerts' },
              { value: '<2min', label: 'Response time' },
              { value: '100%', label: 'Community-driven' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-orange-400">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Built for real emergencies</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every feature is designed for the moments when your community needs to act fast and stay organized.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                color: 'text-danger-400 bg-danger-500/10',
                title: 'Instant Emergency Alerts',
                desc: 'One tap activates your entire community. Every member gets notified immediately with location and severity details.',
              },
              {
                icon: Zap,
                color: 'text-amber-400 bg-amber-500/10',
                title: 'Smart Help Matching',
                desc: 'Automatically matches people who need help with volunteers who have the right skills and resources nearby.',
              },
              {
                icon: Map,
                color: 'text-orange-400 bg-orange-500/10',
                title: 'Live Situation Map',
                desc: 'Real-time map showing emergencies, help requests, volunteer locations, and safe shelters.',
              },
              {
                icon: Users,
                color: 'text-teal-400 bg-teal-500/10',
                title: 'Community Network',
                desc: 'Build a resilient neighborhood network. Know your neighbors\' skills, resources, and vulnerabilities before disaster strikes.',
              },
              {
                icon: Heart,
                color: 'text-pink-400 bg-pink-500/10',
                title: 'Vulnerable Member Protection',
                desc: 'Flag community members who need extra support — elderly, disabled, or those without transportation.',
              },
              {
                icon: Shield,
                color: 'text-blue-400 bg-blue-500/10',
                title: 'Coordinator Tools',
                desc: 'Dedicated tools for emergency coordinators to manage response, escalate severity, and track resolution.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-navy-800 border border-navy-700 rounded-xl p-6 hover:border-navy-600 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">How Hestia works</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Register and join your community',
                desc: 'Create your profile with your skills, resources, and any vulnerabilities. Join a local community or create one for your neighborhood.',
              },
              {
                step: '02',
                title: 'Get alerted when emergencies happen',
                desc: 'When a coordinator or member activates an emergency, everyone in the community gets notified instantly via the dashboard and live alerts.',
              },
              {
                step: '03',
                title: 'Request or offer help',
                desc: 'Submit a help request if you need assistance, or offer your skills and resources as a volunteer. The system matches you automatically.',
              },
              {
                step: '04',
                title: 'Coordinate on the live map',
                desc: 'Track the situation in real-time on the interactive map. See where help is needed, where volunteers are, and where shelters are available.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-400 font-bold text-sm">{step}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-navy-800 border border-orange-500/20 rounded-2xl p-10">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Don't wait for a disaster to organize
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Communities that prepare together respond better. Join Hestia today and build
              the network your neighborhood needs before an emergency strikes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-navy-600 hover:border-navy-500 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Hestia — Community Emergency Response System. Built for resilience.</p>
        </div>
      </footer>
    </div>
  );
}

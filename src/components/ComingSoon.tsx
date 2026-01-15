'use client'

import { Clock, Wrench, FileText, Rocket } from 'lucide-react'

export default function ComingSoon() {
  const features = [
    {
      icon: Wrench,
      title: 'Token Creator Interface',
      description: 'Contract generation only',
    },
    {
      icon: FileText,
      title: 'Tokenomics Configuration Tools',
      description: 'Parameter modeling',
    },
    {
      icon: Clock,
      title: 'Compliance Documentation Templates',
      description: 'Not legal advice',
    },
    {
      icon: Rocket,
      title: 'One-Click Deployment Scripts',
      description: 'Self-hosted execution',
    },
  ]

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coming Soon to Optik Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Future features provide technical tooling only and do not replace professional legal, financial, or security services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-yellow-800">i</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
              <p className="text-sm text-yellow-700">
                These features provide technical tooling only and do not replace professional legal, financial, or security services. 
                Always consult qualified professionals for compliance, legal, and security matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

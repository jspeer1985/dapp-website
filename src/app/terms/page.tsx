import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Optik dApp Factory',
  description: 'Terms of Service for Optik Web3 application factory platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service — Optik dApp Factory</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nature of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Optik provides automated software generation tools that produce project scaffolds and code templates. 
                Optik does not provide business consulting, legal services, financial services, or regulatory compliance services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No Financial or Legal Advice</h2>
              <p className="text-gray-700 leading-relaxed">
                All generated content is provided for technical development purposes only. Nothing provided by Optik 
                constitutes legal advice, financial advice, investment advice, or regulatory guidance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibility</h2>
              <p className="text-gray-700 leading-relaxed">
                Users are solely responsible for reviewing, modifying, auditing, testing, and deploying any 
                generated code prior to production use. Users are responsible for ensuring compliance with all 
                applicable laws and regulations in their jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No Guarantees of Fitness or Profitability</h2>
              <p className="text-gray-700 leading-relaxed">
                Optik makes no guarantees regarding business success, profitability, security, or regulatory 
                approval of any project created using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No Custody of Funds</h2>
              <p className="text-gray-700 leading-relaxed">
                Optik does not custody user funds, deploy contracts on behalf of users, or participate in 
                token issuance or financial transactions beyond software access fees.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Optik be liable for any damages arising from use, deployment, or 
                commercialization of generated projects.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Software License</h2>
              <p className="text-gray-700 leading-relaxed">
                Users are granted a non-exclusive, perpetual license to use generated code in their own projects. 
                Resale or redistribution of the generator platform itself is prohibited.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

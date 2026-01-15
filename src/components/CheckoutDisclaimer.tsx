'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface CheckoutDisclaimerProps {
  onAccept: () => void
  disabled?: boolean
}

export default function CheckoutDisclaimer({ onAccept, disabled = false }: CheckoutDisclaimerProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAccept = () => {
    if (accepted) {
      onAccept()
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-3">
          <h3 className="font-semibold text-yellow-800">Important Notice</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>You are purchasing a software-generated project scaffold and development framework.</p>
            <p>This product does not include legal review, financial compliance, audits, or deployment services.</p>
            <p>You are responsible for reviewing and modifying all generated code prior to production use.</p>
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-yellow-800">
              I understand and agree to the Terms of Service and Disclaimer.
            </span>
          </label>
          
          <button
            onClick={handleAccept}
            disabled={!accepted || disabled}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  )
}

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
            </p>
          </div>

          <div className="grid gap-8">
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Information</h3>
                  <p className="text-gray-600">
                    When you create an account, we collect your name, email address, and company information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Project Data</h3>
                  <p className="text-gray-600">
                    We store information about your dApp projects, including configurations, deployments, and usage statistics.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Payment Information</h3>
                  <p className="text-gray-600">
                    We process payment information through secure third-party services (Stripe) and do not store credit card details.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Usage Analytics</h3>
                  <p className="text-gray-600">
                    We collect analytics data about how you use our platform to improve our services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Service Provision</h3>
                  <p className="text-gray-600">
                    To provide dApp generation, template marketplace, and platform services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Platform Improvement</h3>
                  <p className="text-gray-600">
                    To analyze usage patterns and improve our features and user experience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Communication</h3>
                  <p className="text-gray-600">
                    To send important updates, security notices, and support communications.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Legal Compliance</h3>
                  <p className="text-gray-600">
                    To comply with legal obligations and protect our rights.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Data Protection & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Encryption</h3>
                  <p className="text-gray-600">
                    All data transmissions are encrypted using industry-standard SSL/TLS protocols.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Access Controls</h3>
                  <p className="text-gray-600">
                    Strict access controls and authentication mechanisms protect your data.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Regular Audits</h3>
                  <p className="text-gray-600">
                    We conduct regular security audits and penetration testing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Minimization</h3>
                  <p className="text-gray-600">
                    We only collect data necessary to provide our services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Access and Correction</h3>
                  <p className="text-gray-600">
                    You have the right to access, correct, or delete your personal information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Portability</h3>
                  <p className="text-gray-600">
                    You can request a copy of your data in a machine-readable format.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Opt-Out</h3>
                  <p className="text-gray-600">
                    You can opt out of marketing communications and delete your account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Complaints</h3>
                  <p className="text-gray-600">
                    You can file complaints with data protection authorities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Questions About Privacy?</h3>
                <p className="text-gray-600 mb-6">
                  If you have any questions about this privacy policy or how we handle your data, please contact us.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/docs/support">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Contact Support
                    </button>
                  </Link>
                  <Link href="mailto:privacy@dapp-factory.com">
                    <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Email Privacy Team
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

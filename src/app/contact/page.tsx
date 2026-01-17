'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageSquare, Building, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    tier: 'enterprise',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'contact_page'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold">Thank You!</h1>
          <p className="text-lg text-muted-foreground">
            Our team will contact you within 24 hours.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/pricing">
              Back to Pricing
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold">Contact Sales</h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with our team to discuss your enterprise needs
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                Fill out the form below and our team will reach out to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Interest</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="agency">Agency Tier</option>
                    <option value="enterprise">Enterprise Tier</option>
                    <option value="custom">Custom Solution</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your project needs..."
                    rows={4}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Enterprise?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Custom Solutions</p>
                    <p className="text-sm text-muted-foreground">
                      Tailored implementations for your specific needs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Dedicated Support</p>
                    <p className="text-sm text-muted-foreground">
                      24/7 priority support from our expert team
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Enterprise Security</p>
                    <p className="text-sm text-muted-foreground">
                      Military-grade security and compliance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">sales@yourcompany.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 9-5 EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                Response time: Within 24 hours
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

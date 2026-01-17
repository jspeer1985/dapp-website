import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, tier, plan } = await request.json();

    if (!email || !tier || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: email, tier, plan' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = `lp_${nanoid(32)}`;
    
    // Hash API key for storage
    const hashedApiKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // TODO: Store in database
    // For now, we'll simulate customer creation
    const customer = {
      id: `cust_${nanoid(16)}`,
      email,
      tier,
      plan,
      apiKey: hashedApiKey,
      createdAt: new Date().toISOString(),
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };

    // TODO: Replace with actual database save
    // await db.customers.create(customer);

    console.log('Customer created:', { id: customer.id, email, tier, plan });

    // Return the unhashed API key (only once!)
    return NextResponse.json({
      customerId: customer.id,
      apiKey: apiKey, // Only send this once!
      tier: tier,
      plan: plan,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

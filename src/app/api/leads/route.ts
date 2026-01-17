import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { email, tier, source, name, company, message } = await request.json();

    if (!email || !tier || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: email, tier, source' },
        { status: 400 }
      );
    }

    // Create lead record
    const lead = {
      id: `lead_${nanoid(16)}`,
      email,
      tier,
      source,
      name: name || null,
      company: company || null,
      message: message || null,
      createdAt: new Date().toISOString(),
      status: 'new',
      // Add additional fields as needed
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    };

    // TODO: Store in database
    // await db.leads.create(lead);

    // TODO: Send notification to sales team
    // await sendSalesNotification(lead);

    console.log('Lead created:', {
      id: lead.id,
      email,
      tier,
      source,
      company
    });

    // TODO: Send confirmation email to lead
    // await sendConfirmationEmail(email, tier);

    return NextResponse.json({
      leadId: lead.id,
      message: 'Lead captured successfully. Our team will contact you soon.',
      nextSteps: 'You will receive an email confirmation and our sales team will reach out within 24 hours.'
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve leads (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization
    // const user = await getCurrentUser(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Fetch leads from database
    // const leads = await db.leads.findMany({
    //   orderBy: { createdAt: 'desc' },
    //   take: 50
    // });

    // For now, return empty array
    const leads: any[] = [];

    return NextResponse.json({
      leads,
      total: leads.length,
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

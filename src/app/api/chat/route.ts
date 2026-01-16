
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // Use OpenAI as it is already configured in the project
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'AI Service configuration missing' },
                { status: 500 }
            );
        }

        const systemPrompt = `You are Optik AI, an expert Web3 development assistant specializing in Solana dApp creation. You help developers:

1. Generate Solana smart contract code (Rust/Anchor)
2. Create TypeScript/React frontend components
3. Design token architectures and tokenomics
4. Answer Solana development questions
5. Provide security best practices

Guidelines:
- Be concise but thorough
- Provide code examples when relevant
- Always mention security considerations
- Remind users to test on devnet first
- Use modern Solana/Anchor patterns`;

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            throw new Error(`OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "I couldn't generate a response.";

        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}

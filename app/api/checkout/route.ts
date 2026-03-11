import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe('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', {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    try {
        const { amount, trackTitle, trackId } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Support RSHBKR - ${trackTitle}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/music?success=true&trackId=${trackId}`,
            cancel_url: `${req.headers.get('origin')}/music?canceled=true`,
        });

        return NextResponse.json({ id: session.id });
    } catch (err: any) {
        console.error('Stripe error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

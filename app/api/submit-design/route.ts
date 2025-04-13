import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Create email content
    const emailHtml = `
      <h1>Naujas dizaino užsakymas</h1>
      <p><strong>Kliento informacija:</strong></p>
      <p>Vardas: ${data.name}</p>
      <p>El. paštas: ${data.email}</p>
      <p>Telefonas: ${data.phone || 'Nenurodytas'}</p>
      
      <p><strong>Užsakymo informacija:</strong></p>
      <p>Produktas: ${data.product.name}</p>
      <p>Dydis: ${data.size}</p>
      <p>Kiekis: ${data.quantity}</p>
      <p>Kaina: €${data.totalPrice.toFixed(2)}</p>
      
      <p><strong>Spausdinimo vietos:</strong></p>
      <ul>
        ${data.printAreas.map((area: string) => `<li>${area}</li>`).join('')}
      </ul>
      
      <p><strong>Komentarai:</strong></p>
      <p>${data.comments || 'Nėra'}</p>
      
      <p><strong>Dizaino peržiūros:</strong></p>
    `;
    
    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    await transporter.sendMail({
      from: `"Siemka Design Tool" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `Naujas dizaino užsakymas - ${data.name}`,
      html: emailHtml,
      attachments: Object.entries(data.designPreviews)
        .filter(([_, url]) => url)
        .map(([area, url]) => ({
          filename: `design-${area}.jpg`,
          path: url,
          encoding: 'base64',
        })),
    });
    
    // Save order to database
    const supabase = createRouteHandlerClient({ cookies });
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        customer_name: data.name,
        customer_email: data.email,
        product_id: data.product.id,
        design_url: JSON.stringify(data.designPreviews),
        quantity: data.quantity,
        size: data.size,
        comments: data.comments,
        total_price: data.totalPrice,
      });

    if (dbError) {
      throw dbError;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
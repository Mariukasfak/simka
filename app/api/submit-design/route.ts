import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Formų validacijos schema
const orderFormSchema = z.object({
  name: z.string().min(2, { message: "Vardas turi būti bent 2 simbolių ilgio" }),
  email: z.string().email({ message: "Neteisingas el. pašto formatas" }),
  phone: z.string().optional(),
  size: z.string().min(1, { message: "Pasirinkite dydį" }),
  quantity: z.number().min(1, { message: "Kiekis turi būti bent 1" }).max(1000),
  comments: z.string().optional(),
});

// Nurodome Next.js, kad šis maršrutas turi būti dinaminis
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validuojame duomenis
    const validatedData = orderFormSchema.parse(data);
    
    // Create email content
    const emailHtml = `
      <h1>Naujas dizaino užsakymas</h1>
      <p><strong>Kliento informacija:</strong></p>
      <p>Vardas: ${validatedData.name}</p>
      <p>El. paštas: ${validatedData.email}</p>
      <p>Telefonas: ${validatedData.phone || 'Nenurodytas'}</p>
      
      <p><strong>Užsakymo informacija:</strong></p>
      <p>Produktas: ${data.product.name}</p>
      <p>Dydis: ${validatedData.size}</p>
      <p>Kiekis: ${validatedData.quantity}</p>
      <p>Kaina: €${data.totalPrice.toFixed(2)}</p>
      
      <p><strong>Spausdinimo vietos:</strong></p>
      <ul>
        ${data.printAreas?.map((area: string) => `<li>${area}</li>`).join('') || 'Nenurodyta'}
      </ul>
      
      <p><strong>Komentarai:</strong></p>
      <p>${validatedData.comments || 'Nėra'}</p>
      
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
    
    // Tik siųsti el. laišką, jei apibrėžti el. pašto parametrai
    if (process.env.EMAIL_FROM && process.env.EMAIL_TO) {
      await transporter.sendMail({
        from: `"Siemka Design Tool" <${process.env.EMAIL_FROM}>`,
        to: process.env.EMAIL_TO,
        subject: `Naujas dizaino užsakymas - ${validatedData.name}`,
        html: emailHtml,
        attachments: Object.entries(data.designPreviews || {})
          .filter(([_, url]) => url)
          .map(([area, url]) => ({
            filename: `design-${area}.jpg`,
            path: url as string,
            encoding: 'base64',
          })),
      });
    }
    
    // Get user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Save order to database
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: userId, // Pridėtas vartotojo ID, jei prisijungęs
        customer_name: validatedData.name,
        customer_email: validatedData.email,
        product_id: data.product.id,
        design_url: JSON.stringify(data.designPreviews || {}),
        quantity: validatedData.quantity,
        size: validatedData.size,
        comments: validatedData.comments,
        total_price: data.totalPrice,
        status: 'pending',
      });

    if (dbError) {
      console.error('Error saving to database:', dbError);
      throw dbError;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing order:', error);
    
    // Grąžinkime informatyvesnę klaidą, jei tai validacijos klaida
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
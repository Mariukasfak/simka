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
    
    // Create detailed product info for email
    const productInfo = `${data.product.name} (${data.product.id})`;
    const selectedAreas = data.printAreas?.map((area: string) => {
      const areaNames: Record<string, string> = {
        'front': 'Priekis',
        'back': 'Nugara',
        'left-sleeve': 'Kairė rankovė',
        'right-sleeve': 'Dešinė rankovė'
      };
      return areaNames[area] || area;
    }).join(', ') || 'Nenurodyta';

    // Create email content with more detailed information
    const emailHtml = `
      <h1>Naujas dizaino užsakymas</h1>
      <p><strong>Kliento informacija:</strong></p>
      <p>Vardas: ${validatedData.name}</p>
      <p>El. paštas: ${validatedData.email}</p>
      <p>Telefonas: ${validatedData.phone || 'Nenurodytas'}</p>
      
      <p><strong>Užsakymo informacija:</strong></p>
      <p>Produktas: ${productInfo}</p>
      <p>Dydis: ${validatedData.size}</p>
      <p>Kiekis: ${validatedData.quantity}</p>
      <p>Kaina: €${data.totalPrice.toFixed(2)}</p>
      
      <p><strong>Spausdinimo vietos:</strong> ${selectedAreas}</p>
      
      <p><strong>Komentarai:</strong></p>
      <p>${validatedData.comments || 'Nėra'}</p>
      
      <p><strong>Dizaino peržiūros:</strong></p>
      <p>Dizaino peržiūros yra pridėtos kaip priedai (attachments).</p>
      
      <p>Šis laiškas sugeneruotas automatiškai iš susikurk.siemka.lt platformos.</p>
    `;
    
    // Configure nodemailer with fallback options
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });
    
    // Set recipient email with fallback to info@siemka.lt
    const recipientEmail = process.env.EMAIL_TO || "info@siemka.lt";
    
    // Send email with all designs as attachments
    try {
      await transporter.sendMail({
        from: `"Siemka Design Tool" <${process.env.EMAIL_FROM || "noreply@siemka.lt"}>`,
        to: recipientEmail,
        subject: `Naujas dizaino užsakymas - ${validatedData.name}`,
        html: emailHtml,
        attachments: Object.entries(data.designPreviews || {})
          .filter(([_, url]) => url)
          .map(([area, url]) => {
            const areaNames: Record<string, string> = {
              'front': 'Priekis',
              'back': 'Nugara',
              'left-sleeve': 'Kairė rankovė',
              'right-sleeve': 'Dešinė rankovė'
            };
            return {
              filename: `design-${areaNames[area as string] || area}.jpg`,
              path: url as string,
              encoding: 'base64',
            };
          }),
      });
      console.log(`Email sent successfully to ${recipientEmail}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue with saving to database even if email fails
    }
    
    // Get user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    try {
      // Save order to database with proper types
      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          user_id: userId, // Pridėtas vartotojo ID, jei prisijungęs
          customer_name: validatedData.name,
          customer_email: validatedData.email,
          customer_phone: validatedData.phone,
          product_type: data.product.type, // String, pvz.: 'hoodie', 'tshirt'
          product_variant: data.product.id, // String, pvz.: 'hoodie-light'
          product_name: data.product.name, // String
          design_previews: data.designPreviews, // Tiesiogiai kaip JSON
          design_states: data.designStates, // Visų pozicijų dizaino būsenos kaip JSON
          quantity: validatedData.quantity,
          size: validatedData.size,
          comments: validatedData.comments,
          total_price: data.totalPrice,
          status: 'pending', // Pradinis užsakymo statusas
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Error saving to database:', dbError);
        throw dbError;
      }
    } catch (dbError) {
      console.error('Database error details:', dbError);
      // Continue with success response even if database save fails
      // Email notification is more important in this case
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
      { error: 'Failed to process order', details: String(error) },
      { status: 500 }
    );
  }
}
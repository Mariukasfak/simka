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
      <p>Dizaino peržiūros yra pridėtos kaip priedai (attachments). Originali logotipo versija taip pat pridėta.</p>
      
      <p>Šis laiškas sugeneruotas automatiškai iš susikurk.siemka.lt platformos.</p>
    `;
    
    // Bandome išsaugoti užsakymą į duomenų bazę
    let userId = null;
    
    try {
      // Supabase cookies() turi būti async apdoroti
      const cookiesStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookiesStore });
      
      // Gauname vartotojo sesiją
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id || null;

      // Išsaugome užsakymą duomenų bazėje
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error: dbError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            customer_name: validatedData.name,
            customer_email: validatedData.email,
            customer_phone: validatedData.phone,
            product_type: data.product.type,
            product_variant: data.product.id,
            product_name: data.product.name,
            design_previews: data.designPreviews || {},
            design_states: data.designStates || {},
            quantity: validatedData.quantity,
            size: validatedData.size,
            comments: validatedData.comments,
            total_price: data.totalPrice,
            status: 'pending',
            created_at: new Date().toISOString(),
            // Išsaugome originalų logotipą
            original_logo: data.uploadedImage || null,
          });

        if (dbError) {
          console.error('Error saving to database:', dbError);
          // Pratęsiame vykdymą, net jei ir nepavyksta išsaugoti DB
        }
      } else {
        console.warn('Missing Supabase configuration - skipping database save');
      }
    } catch (dbError) {
      console.error('Database error details:', dbError);
      // Pratęsiame vykdymą, el. pašto siuntimas svarbesnis
    }
    
    // Bandome siųsti el. laišką
    try {
      // Sukonfigūruojame nodemailer pagal Hostinger SMTP nustatymus
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER || 'smtp.hostinger.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: Number(process.env.EMAIL_PORT) === 465, // true naudojant 465 portą
        auth: {
          user: process.env.EMAIL_USER || 'labas@siemka.lt',
          pass: process.env.EMAIL_PASSWORD || 'Simona672as.',
        },
        // Nustatome didesnius timeout parametrus
        connectionTimeout: 10000, // 10 sekundžių
        socketTimeout: 20000, // 20 sekundžių
        debug: true, // Laikinas debuginimas
      });
      
      // Nustatome gavėjo el. paštą su numatyta reikšme
      const recipientEmail = process.env.EMAIL_TO || "labas@siemka.lt";

      // Sudarome priedų sąrašą - dabar naudojame PNG formatą, kad išsaugotume permatomumą
      const attachments = Object.entries(data.designPreviews || {})
        .filter(([_, url]) => url)
        .map(([area, url]) => {
          const areaNames: Record<string, string> = {
            'front': 'Priekis',
            'back': 'Nugara',
            'left-sleeve': 'Kairė rankovė',
            'right-sleeve': 'Dešinė rankovė'
          };
          return {
            filename: `design-${areaNames[area as string] || area}.png`,
            path: url as string,
            encoding: 'base64',
            contentType: 'image/png'
          };
        });
      
      // Pridedame originalų logotipą kaip priedą
      if (data.uploadedImage) {
        attachments.push({
          filename: 'original-logo.png',
          path: data.uploadedImage,
          encoding: 'base64',
          contentType: 'image/png'
        });
      }
      
      // Siunčiame el. laišką
      await transporter.sendMail({
        from: `"Siemka Design Tool" <${process.env.EMAIL_FROM || "labas@siemka.lt"}>`,
        to: recipientEmail,
        subject: `Naujas dizaino užsakymas - ${validatedData.name}`,
        html: emailHtml,
        attachments: attachments,
      });
      
      console.log(`Email sent successfully to ${recipientEmail}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Tęsiame vykdymą, net jei el. paštas nepavyko
    }
    
    // Nesvarbu ar pavyko išsiųsti el. paštą ar išsaugoti duomenų bazėje,
    // grąžiname sėkmingą atsakymą vartotojui
    return NextResponse.json({ 
      success: true,
      message: "Užsakymas priimtas. Susisieksime su jumis artimiausiu metu."
    });
  } catch (error) {
    console.error('Error processing order:', error);
    
    // Grąžinkime informatyvesnę klaidą, jei tai validacijos klaida
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validacijos klaida', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Įvyko klaida apdorojant užsakymą', details: String(error) },
      { status: 500 }
    );
  }
}
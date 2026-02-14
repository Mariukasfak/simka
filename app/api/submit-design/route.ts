import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { generateEmailHtml } from './email-utils';
import { orderFormSchema } from '../../../lib/validations/order';

// Nurodome Next.js, kad šis maršrutas turi būti dinaminis
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validuojame duomenis
    const validatedData = orderFormSchema.parse(data);
    
    // Generuojame el. laiško HTML su saugiai apdorotais duomenimis
    const emailHtml = generateEmailHtml(validatedData, data);
    
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
      // Patikriname ar yra visi reikiami el. pašto konfigūracijos kintamieji
      const {
        EMAIL_SERVER,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASSWORD,
        EMAIL_TO,
        EMAIL_FROM
      } = process.env;

      if (!EMAIL_SERVER || !EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_TO || !EMAIL_FROM) {
        console.error('Missing email configuration. Skipping email sending.');
        throw new Error('Email configuration is incomplete');
      }

      // Sukonfigūruojame nodemailer
      const transporter = nodemailer.createTransport({
        host: EMAIL_SERVER,
        port: Number(EMAIL_PORT) || 465,
        secure: Number(EMAIL_PORT) === 465 || !EMAIL_PORT, // true naudojant 465 portą arba jei portas nenurodytas (numatytasis 465)
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
        // Nustatome didesnius timeout parametrus
        connectionTimeout: 10000, // 10 sekundžių
        socketTimeout: 20000, // 20 sekundžių
        debug: false,
      });
      
      // Nustatome gavėjo el. paštą
      const recipientEmail = EMAIL_TO;

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
        from: `"Siemka Design Tool" <${EMAIL_FROM}>`,
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
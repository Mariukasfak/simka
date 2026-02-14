
interface ValidatedData {
  name: string;
  email: string;
  phone?: string;
  size: string;
  quantity: number;
  comments?: string;
}

interface ProductData {
  product: {
    name: string;
    id: string | number;
  };
  printAreas?: string[];
  totalPrice: number;
}

/**
 * Escapes special characters in a string to prevent HTML injection.
 * Handles non-string inputs by converting them to string first.
 */
export function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) {
    return '';
  }
  const str = String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateEmailHtml(validatedData: ValidatedData, data: ProductData): string {
  // Create detailed product info for email
  // Escape product name just in case
  const productInfo = `${escapeHtml(data.product.name)} (${escapeHtml(data.product.id)})`;

  const selectedAreas = (data.printAreas || []).map((area: string) => {
    const areaNames: Record<string, string> = {
      'front': 'Priekis',
      'back': 'Nugara',
      'left-sleeve': 'Kairė rankovė',
      'right-sleeve': 'Dešinė rankovė'
    };
    // If area is not in the map, it's a custom string which should be escaped
    return areaNames[area] || escapeHtml(area);
  }).join(', ') || 'Nenurodyta';

  // Create email content with more detailed information
  return `
      <h1>Naujas dizaino užsakymas</h1>
      <p><strong>Kliento informacija:</strong></p>
      <p>Vardas: ${escapeHtml(validatedData.name)}</p>
      <p>El. paštas: ${escapeHtml(validatedData.email)}</p>
      <p>Telefonas: ${validatedData.phone ? escapeHtml(validatedData.phone) : 'Nenurodytas'}</p>

      <p><strong>Užsakymo informacija:</strong></p>
      <p>Produktas: ${productInfo}</p>
      <p>Dydis: ${escapeHtml(validatedData.size)}</p>
      <p>Kiekis: ${validatedData.quantity}</p>
      <p>Kaina: €${data.totalPrice.toFixed(2)}</p>

      <p><strong>Spausdinimo vietos:</strong> ${selectedAreas}</p>

      <p><strong>Komentarai:</strong></p>
      <p>${validatedData.comments ? escapeHtml(validatedData.comments) : 'Nėra'}</p>

      <p><strong>Dizaino peržiūros:</strong></p>
      <p>Dizaino peržiūros yra pridėtos kaip priedai (attachments). Originali logotipo versija taip pat pridėta.</p>

      <p>Šis laiškas sugeneruotas automatiškai iš susikurk.siemka.lt platformos.</p>
    `;
}

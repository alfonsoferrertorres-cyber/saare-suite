// apps/control-plane/src/cpaas/adapters/twilio.adapter.ts
import { ICPaaSAdapter, CPaaSMessagePayload, CPaaSResponse } from '../interface';

export class TwilioAdapter implements ICPaaSAdapter {
  name = 'Twilio';
  constructor(private accountSid: string, private authToken: string) {}

  async sendMessage(payload: CPaaSMessagePayload): Promise<CPaaSResponse> {
    // Ejemplo mediante llamada HTTP directa (ideal para Cloudflare Workers / Zero-dependency)
    const auth = btoa(`${this.accountSid}:${this.authToken}`);
    const body = new URLSearchParams({
      To: payload.to,
      From: payload.from || '',
      Body: payload.body,
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await res.json() as any;
    return {
      success: res.ok,
      provider: this.name,
      messageId: data.sid || '',
      timestamp: new Date().toISOString(),
      rawResponse: data,
    };
  }
}
export async function sendSMS(to: string, text: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error('[Twilio] Missing environment variables');
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', text);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log(`[Twilio] HTTP Request sent to: ${url}`);
    console.log(`[Twilio] Payload: ${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Twilio] API responded with ERROR:', JSON.stringify(errorData));
      return false;
    }

    const responseData = await response.json();
    console.log(`[Twilio] API responded with SUCCESS:`, responseData.sid);
    return true;
  } catch (error) {
    console.error('[Twilio] SMS error:', error);
    return false;
  }
}

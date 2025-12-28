import 'dotenv/config';

export default function WabaAPI() {
    const token = process.env["WABA_TOKEN"];
    const BASE_URL = process.env["WABA_URL"]
    const apiVersion = 'v24.0';
 
    return {
        sendMessage:
        async function (phonId: string, to: string, message: any) {
            console.log(`Preparing to send message to ${to} via phone ID ${phonId}`);
            try {
                const response = await fetch(`${BASE_URL}/${apiVersion}/${phonId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",    
                        recipient_type: "individual",
                        to: to,
                        type: "text",
                        text: {
                            preview_url: false,
                            body: message,
                        }
                    }),
                    redirect: "follow"
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    return { error: `HTTP error! status: ${response.status}`, details: errorText };
                }
                return response.json();
            } catch (error) {
                return { error: 'Failed to send message', details: error };
            }
        }
    }
}
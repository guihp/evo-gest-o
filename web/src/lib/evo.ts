const BASE_URL = process.env.EVO_API_URL || 'https://evo-tss8sg44wg8ssc8wgck04cg8.medmasters.ai';
const API_KEY = process.env.EVO_API_KEY || 'vvdM4UPeZhi0riwmNsZjokX2p1BQRD41';

export const EvoApi = {
    getHeaders: () => ({
        'apikey': API_KEY,
        'Content-Type': 'application/json'
    }),

    async fetchInstances() {
        const res = await fetch(`${BASE_URL}/instance/fetchInstances`, {
            headers: this.getHeaders(),
            cache: 'no-store'
        });
        return res.json();
    },

    async createInstance(name: string) {
        const res = await fetch(`${BASE_URL}/instance/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ instanceName: name, qrcode: true })
        });
        return res.json();
    },

    async deleteInstance(name: string) {
        const res = await fetch(`${BASE_URL}/instance/delete/${name}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return res.json();
    },

    async logoutInstance(name: string) {
        const res = await fetch(`${BASE_URL}/instance/logout/${name}`, {
            method: 'DELETE', // Logout is often DELETE or POST
            headers: this.getHeaders()
        });
        return res.json();
    },

    async restartInstance(name: string) {
        const res = await fetch(`${BASE_URL}/instance/restart/${name}`, {
            method: 'GET', // Check this, often GET or POST
            headers: this.getHeaders()
        });
        return res.json();
    },

    async connectInstance(name: string) {
        const res = await fetch(`${BASE_URL}/instance/connect/${name}`, {
            headers: this.getHeaders()
        });
        // This typically returns JSON with base64 or just base64.
        // Documentation says it returns base64.
        // However, if we fetch it, we need to know the format.
        // Let's assume JSON with `base64` or `code`.
        // If text/response body is raw base64, handle that.
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            return json;
        } catch {
            return { base64: text };
        }
    },

    async connectionState(name: string) {
        const res = await fetch(`${BASE_URL}/instance/connectionState/${name}`, {
            headers: this.getHeaders()
        });
        return res.json();
    }
};

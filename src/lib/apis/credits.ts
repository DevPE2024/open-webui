import { WEBUI_API_BASE_URL } from '$lib/constants';

interface CreditsResponse {
	success: boolean;
	credits: number;
	hasCredits: boolean;
	planName?: string;
	error?: string;
}

interface ConsumeCreditsRequest {
	credits?: number;
}

interface ConsumeCreditsResponse {
	success: boolean;
	credits?: number;
	consumed?: number;
	message?: string;
	error?: string;
}

export const getCredits = async (token: string = ''): Promise<CreditsResponse> => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/credits/`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const consumeCredits = async (
	token: string = '',
	credits: number = 1
): Promise<ConsumeCreditsResponse> => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/credits/consume`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			credits
		})
	})
		.then(async (res) => {
			if (!res.ok) {
				const errorData = await res.json();
				if (res.status === 402) {
					// Payment Required - Sem créditos
					throw {
						...errorData,
						insufficientCredits: true
					};
				}
				throw errorData;
			}
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = err;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};


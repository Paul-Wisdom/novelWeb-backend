import axios from "axios"
import { verify } from "crypto"
import { PAY_STACK_SECRET_KEY, PAYSTACK_API_URL, PAYSTACK_CALLBACK_URL } from "../../config"
import { error } from "console"
import { errorHandler } from "../../utils"

interface PayStackAPIResponse {
    status: string
    message: string
}
interface PaystackTransactionInitializationResponse extends PayStackAPIResponse {
    data: {
        authorization_url: string
        access_code: string
        reference: string
    }
}
interface PaystackTransactionVerificationResponse extends PayStackAPIResponse {
    data: {
        status: string
        reference: string
        paid_at: string
        amount: number
        currency: string
    }
}
const apiInstance = axios.create({
    baseURL: PAYSTACK_API_URL,
    headers: {
        'Authorization': `Bearer ${PAY_STACK_SECRET_KEY}`
    }
})
const PaymentService = {
    initializeTransaction: async (email: string, amount: number, transactionId: string) => {
        try {
            const response = await apiInstance.post<PaystackTransactionInitializationResponse>('/initialize', {
                email,
                amount: amount * 100,
                reference: transactionId,
                currency: 'NGN',
                callback_url: PAYSTACK_CALLBACK_URL
            })
            console.log(response.data)
            return response.data.data
        } catch (e) {
            console.log(e)
            if (axios.isAxiosError(e)) {
                throw errorHandler(`${e.code}: ${e.message}`, 'INTERNAL_SERVER_ERROR')
            }
        }

    },
    verifyTransaction: async (reference: string) => {
        try {
            const response = await apiInstance.get<PaystackTransactionVerificationResponse>(`/verify/${reference}`);
            console.log(response.data)
            return response.data.data
        } catch (e) {
            console.log(e)
            if (axios.isAxiosError(e)) {
                throw errorHandler(`${e.code}: ${e.message}`, 'INTERNAL_SERVER_ERROR')
            }
        }


    }
}

export default PaymentService
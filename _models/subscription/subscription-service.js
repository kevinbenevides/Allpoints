import { ServiceBase } from '/_models/service-base.js'

class SubscriptionService
{
    constructor(host, apiKey)
    {
        this.api = new ServiceBase(host);
        this.apiKey = apiKey;
    }

    async myPaymentMethod(token)
    {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var providerCustomer = await this.api.get('me/providers/iugu', myHeaders);

        if(providerCustomer)
        {
            var paymentMethods = await this.api.get('me/payment-methods', myHeaders);

            if(paymentMethods && paymentMethods.length > 0)
            {
                return await this.api.get('me/providers/iugu/' + providerCustomer.provider_customer_id + '/payment-methods/' + paymentMethods[0].provider_id, myHeaders);
            }
        }

        return null;
    }

    async mySubscription(token)
    {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var sub = await this.api.get('me/subscriptions', myHeaders);

        if (sub.length > 0)
        {
            var plan = await this.api.get('plans/' + sub[0]["plan_id"], myHeaders);

            if (plan)
            {
                plan.name = plan.name.replace("2021 ", "");
                plan.valueUnits = plan.value / 100;
                plan.points = plan.valueUnits * 1.1;

                return {
                    subscription: sub,
                    plan: plan
                };
            }
        }

        return null;
    }

    async cancelSubscription(token, reason, subscription)
    {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var body = {
            "active": false,
            "cancel_reason": reason
        }

        var response = await this.api.put('me/subscriptions/' + subscription, body, myHeaders);

        return response
    }

    async changeSubscription(payload, id, token)
    {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var response = await this.api.put('plans/' + id, payload, myHeaders);
        return response;
    }

    async createSubscription(token, payload)
    {
        var myHeaders = {
            "Authorization": "Bearer " + token
        }

        var response = await this.api.justPost('me/subscriptions', payload, myHeaders);

        return response;
    }
}

window.SubscriptionService = SubscriptionService;

export { SubscriptionService }
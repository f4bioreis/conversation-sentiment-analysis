import { LightningElement, api } from 'lwc';
import getCustomerSentiment from '@salesforce/apex/CustomerSentimentController.getCustomerSentiment';

const SENTIMENTS = {
    Positive: {
        icon: 'utility:smiley_and_people',
        class: 'slds-theme_success'
    },
    Neutral: {
        icon: 'utility:sentiment_neutral',
        class: 'slds-theme_warning'
    },
    Negative: {
        icon: 'utility:sentiment_negative',
        class: 'slds-theme_error'
    }
};

export default class CustomerSentiment extends LightningElement {

    @api recordId = '';
    @api mode = '';
    customerSentiment = 'Positive';
    isLoading = false;

    get sentimentIcon() {
        return SENTIMENTS[this.customerSentiment].icon ?? '';
    }

    get sentimentClasses() {
        let sentimentClasses = 'slds-badge slds-p-horizontal_small slds-align-middle ';
        sentimentClasses += SENTIMENTS[this.customerSentiment].class ?? '';
    }

    get isRefreshButtonVisible() {
        return this.mode === 'On Button Click';
    }

    refreshSentiment() {
        this.fetchCustomerSentiment();
    }

    fetchCustomerSentiment() {
        this.beginLoading();

        const messagingSessionId = this.recordId;
        getCustomerSentiment({ messagingSessionId })
        .then(result => {
            this.customerSentiment = result;
        })
        .catch(error => {
            console.error('Unable to fetch customer sentiment. Details:', error);
        })
        .finally(() => {
            this.endLoading();
        });
    }

    beginLoading() {
        this.isLoading = true;
    }

    endLoading() {
        this.isLoading = false;
    }
}
import { LightningElement, api, track, wire } from 'lwc';
import getCustomerSentiment from '@salesforce/apex/CustomerSentimentController.getCustomerSentiment';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import ConversationAgentSendChannel from '@salesforce/messageChannel/lightning__conversationAgentSend';
import ConversationEndUserChannel from '@salesforce/messageChannel/lightning__conversationEndUserMessage';
import ConversationEndedChannel from '@salesforce/messageChannel/lightning__conversationEnded';

export default class CustomerSentiment extends LightningElement {

    @api recordId = '';
    @api mode = MODE_EVERY_MESSAGE;
    @track customerSentiment = 'Positive';
    isLoading = false;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.fetchCustomerSentiment();
        
        if (this.mode === MODE_EVERY_MESSAGE) {
            this.subscribeToAgentMessageChannel();
            this.subscribeToEndUserMessageChannel();
        }
        else if (this.mode === MODE_END_CONV) {
            this.subscribeToConversationEndChannel();
        }
    }

    get sentimentIcon() {
        return SENTIMENTS[this.customerSentiment].icon ?? '';
    }

    get sentimentClasses() {
        let sentimentClasses = 'slds-badge slds-p-horizontal_small slds-align-middle ';
        sentimentClasses += SENTIMENTS[this.customerSentiment].class ?? '';
        return sentimentClasses;
    }

    get isRefreshButtonVisible() {
        return this.mode === MODE_BUTTON_CLICK;
    }

    subscribeToAgentMessageChannel() {
        subscribe(
            this.messageContext,
            ConversationAgentSendChannel,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    subscribeToEndUserMessageChannel() {
        subscribe(
            this.messageContext,
            ConversationEndUserChannel,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    subscribeToConversationEndChannel() {
        subscribe(
            this.messageContext,
            ConversationEndedChannel,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
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
            console.log('Customer Sentiment:', this.customerSentiment);
        })
        .catch(error => {
            console.error('Unable to fetch customer sentiment. Details:', error);
        })
        .finally(() => {
            this.endLoading();
        });
    }

    handleMessage(message) {
        console.log('Message ID:', message.recordId);
        this.fetchCustomerSentiment();
    }

    beginLoading() {
        this.isLoading = true;
    }

    endLoading() {
        this.isLoading = false;
    }
}

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

const MODE_EVERY_MESSAGE = 'After Every Message';
const MODE_BUTTON_CLICK = 'On Button Click';
const MODE_END_CONV = 'End of Conversation';
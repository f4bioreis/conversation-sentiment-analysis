import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getCustomerSentiment from '@salesforce/apex/CustomerSentimentController.getCustomerSentiment';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import ConversationAgentSendChannel from '@salesforce/messageChannel/lightning__conversationAgentSend';
import ConversationEndUserChannel from '@salesforce/messageChannel/lightning__conversationEndUserMessage';
import ConversationEndedChannel from '@salesforce/messageChannel/lightning__conversationEnded';
import MESSAGING_SESSION_STATUS from '@salesforce/schema/MessagingSession.Status';
import CARD_TITLE_LABEL from '@salesforce/label/c.ConversationSentiment_Title';
import POSITIVE_LABEL from '@salesforce/label/c.ConversationSentiment_Positive';
import NEUTRAL_LABEL from '@salesforce/label/c.ConversationSentiment_Neutral';
import NEGATIVE_LABEL from '@salesforce/label/c.ConversationSentiment_Negative';
import ANALYZE_BUTTON_MODE_EMPTY_STATE_MESSAGE from '@salesforce/label/c.ConversationSentiment_AnalyzeButtonModeEmptyStateMessage';
import CONV_END_MODE_EMPTY_STATE_MESSAGE from '@salesforce/label/c.ConversationSentiment_ConvEndModeEmptyStateMessage';
import ANALYZE_BUTTON_LABEL from '@salesforce/label/c.ConversationSentiment_AnalyzeButton';
import FRIENDLY_ERROR_MESSAGE from '@salesforce/label/c.ConversationSentiment_DefaultError';

export default class CustomerSentiment extends LightningElement {

    @api recordId = '';
    @api mode = MODE_REAL_TIME;
    isLoading = false;

    @wire(MessageContext)
    messageContext;

    messagingSession;

    @wire(getRecord, { recordId: '$recordId', fields: RECORD_FIELDS })
    recordSetter({ error, data }) {
        if (data) {
            this.hasError = false;
            this.messagingSession = data;
            this.initialize();
        } else if (error) {
            this.hasError = true;
            console.error('An error has occurred when fetching the MessagingSession record:', error);
        }
    }

    labels = {
        cardTitle: CARD_TITLE_LABEL,
        analyzeBtnEmptyStateMessage: ANALYZE_BUTTON_MODE_EMPTY_STATE_MESSAGE,
        convEndModeEmptyStateMessage: CONV_END_MODE_EMPTY_STATE_MESSAGE,
        friendlyErrorMessage: FRIENDLY_ERROR_MESSAGE,
        analyzeButton: ANALYZE_BUTTON_LABEL,
    }

    customerSentiment = '';

    initialize() {
        if (this.isSessionEnded || this.mode === MODE_REAL_TIME) {
            this.fetchCustomerSentiment();
        }
        
        if (this.mode === MODE_REAL_TIME) {
            this.subscribeToAgentMessageChannel();
            this.subscribeToEndUserMessageChannel();
        }
        else if (this.mode === MODE_CONV_END) {
            this.subscribeToConversationEndChannel();
        }
    }

    get sentimentIcon() {
        return SENTIMENTS[this.customerSentiment]?.icon ?? '';
    }

    get sentimentClasses() {
        let sentimentClasses = 'slds-badge slds-p-horizontal_small slds-align-middle ';
        sentimentClasses += SENTIMENTS[this.customerSentiment]?.class ?? '';
        return sentimentClasses;
    }

    get customerSentimentDisplay() {
        return SENTIMENTS[this.customerSentiment]?.label ?? '';
    }

    get isErrorState() {
        return this.hasError;
    }

    get isEmptyState() {
        return !this.isErrorState
        && !this.customerSentiment
        && (this.mode === MODE_CONV_END || this.mode === MODE_ANALYZE_BUTTON);
    }

    get isModeAnalyzeButton() {
        return this.mode === MODE_ANALYZE_BUTTON;
    }

    get isModeConvEnd() {
        return this.mode === MODE_CONV_END;
    }

    get isSessionEnded() {
        return this.messagingSession.fields.Status.value === 'Ended';
    }

    subscribeToAgentMessageChannel() {
        subscribe(
            this.messageContext,
            ConversationAgentSendChannel,
            () => this.analyzeSentiment(),
            { scope: APPLICATION_SCOPE }
        );
    }

    subscribeToEndUserMessageChannel() {
        subscribe(
            this.messageContext,
            ConversationEndUserChannel,
            () => this.analyzeSentiment(),
            { scope: APPLICATION_SCOPE }
        );
    }

    subscribeToConversationEndChannel() {
        subscribe(
            this.messageContext,
            ConversationEndedChannel,
            () => this.analyzeSentiment(),
            { scope: APPLICATION_SCOPE }
        );
    }

    analyzeSentiment() {
        this.fetchCustomerSentiment();
    }

    fetchCustomerSentiment() {
        this.beginLoading();

        const messagingSessionId = this.recordId;
        getCustomerSentiment({ messagingSessionId })
        .then(result => {
            this.customerSentiment = result;
            this.hasError = false;
            console.log('Customer Sentiment:', this.customerSentiment);
        })
        .catch(error => {
            this.customerSentiment = '';
            this.hasError = true;
            console.error('Unable to fetch conversation sentiment. Details:', error);
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

const SENTIMENTS = {
    Positive: {
        icon: 'utility:smiley_and_people',
        class: 'slds-theme_success',
        label: POSITIVE_LABEL
    },
    Neutral: {
        icon: 'utility:sentiment_neutral',
        class: 'slds-theme_warning',
        label: NEUTRAL_LABEL
    },
    Negative: {
        icon: 'utility:sentiment_negative',
        class: 'slds-theme_error',
        label: NEGATIVE_LABEL
    }
};

const MODE_REAL_TIME = 'Real-time';
const MODE_ANALYZE_BUTTON = 'Analyze Button';
const MODE_CONV_END = 'Conversation End';

const RECORD_FIELDS = [MESSAGING_SESSION_STATUS];
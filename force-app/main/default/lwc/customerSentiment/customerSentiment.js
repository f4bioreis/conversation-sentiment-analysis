import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getCustomerSentiment from '@salesforce/apex/CustomerSentimentController.getCustomerSentiment';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import ConversationAgentSendChannel from '@salesforce/messageChannel/lightning__conversationAgentSend';
import ConversationEndUserChannel from '@salesforce/messageChannel/lightning__conversationEndUserMessage';
import ConversationEndedChannel from '@salesforce/messageChannel/lightning__conversationEnded';
import SentimentAnalysis from './types/SentimentAnalysis';
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
    @api includeExplanation = false;
    isLoading = false;

    @wire(MessageContext)
    messageContext;

    // Stores data from the MessagingSession record
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

    /** @type {SentimentAnalysis} */
    @track
    sentimentAnalysis = {
        classification: '',
        explanation: '',
        explanationLocale: ''
    };

    labels = {
        cardTitle: CARD_TITLE_LABEL,
        analyzeBtnEmptyStateMessage: ANALYZE_BUTTON_MODE_EMPTY_STATE_MESSAGE,
        convEndModeEmptyStateMessage: CONV_END_MODE_EMPTY_STATE_MESSAGE,
        friendlyErrorMessage: FRIENDLY_ERROR_MESSAGE,
        analyzeButton: ANALYZE_BUTTON_LABEL
    };

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

    get sentimentClassification() {
        return this.sentimentAnalysis.classification;
    }

    get sentimentClassificationDisplay() {
        return SENTIMENTS[this.sentimentClassification]?.label ?? '';
    }

    get sentimentIcon() {
        return SENTIMENTS[this.sentimentClassification]?.icon ?? '';
    }

    get sentimentClasses() {
        let sentimentClasses = 'slds-badge slds-p-horizontal_small slds-align-middle ';
        sentimentClasses += SENTIMENTS[this.sentimentClassification]?.class ?? '';
        return sentimentClasses;
    }

    get isErrorState() {
        return this.hasError;
    }

    get isEmptyState() {
        return !this.isErrorState
        && !this.sentimentClassification
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
        const includeExplanation = this.includeExplanation;
        getCustomerSentiment({ messagingSessionId, includeExplanation })
        .then(result => {
            this.sentimentAnalysis = result;
            this.hasError = false;
        })
        .catch(error => {
            this.resetSentimentAnalysis();
            this.hasError = true;
            console.error('Unable to fetch conversation sentiment. Details:', error);
        })
        .finally(() => {
            this.endLoading();
        });
    }

    resetSentimentAnalysis() {
        this.sentimentAnalysis = {
            classification: '',
            explanation: '',
            explanationLocale: ''
        };
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

const RECORD_FIELDS = [MESSAGING_SESSION_STATUS];

/**
 * Modes for triggering sentiment analysis in the component.
 * - Real-time: Automatically each time a message is sent/received.
 * - Analyze Button: When the user clicks an "Analyze" button.
 * - Conversation End: When the Messaging Session ends.
 * 
 * 
 * Note: if these values are updated, they must also be updated in the component's XML file,
 * in the datasource of property "mode", as dynamic fetching in the XML file is not supported.
*/

const MODE_REAL_TIME = 'Real-time';
const MODE_ANALYZE_BUTTON = 'Analyze Button';
const MODE_CONV_END = 'Conversation End';
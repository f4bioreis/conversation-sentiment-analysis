public class CustomerSentimentClassificationService extends CustomerSentimentService {

    public override ConversationSentimentDTO getCustomerSentiment(Id messagingSessionId) {
        this.validateId(messagingSessionId);
        
        ConnectApi.WrappedValue messagingSessionContainer = new ConnectApi.WrappedValue();
        messagingSessionContainer.value = new Map<String, String>{
            'Id' => messagingSessionId
        };

        ConnectApi.EinsteinPromptTemplateGenerationsInput templateInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        templateInput.isPreview = false;
        templateInput.inputParams = new Map<String, ConnectApi.WrappedValue>();
        templateInput.inputParams.put('Input:Messaging_Session', messagingSessionContainer);

        templateInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        templateInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation templateResponse =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
                'Conversation_Sentiment_Classifier',
                templateInput
            );
        
        String sentimentClassification = templateResponse.generations[0].text;
        if (!customerSentiments.contains(sentimentClassification)) {
            throw new UnexpectedSentimentException('The sentiment returned is unexpected: ' + sentimentClassification);
        }
        
        ConversationSentimentDTO sentimentContainer = new ConversationSentimentDTO();
        sentimentContainer.classification = sentimentClassification;
        return sentimentContainer;
    }

    private List<String> customerSentiments = new List<String>{
        System.Label.ConversationSentiment_Positive,
        System.Label.ConversationSentiment_Neutral,
        System.Label.ConversationSentiment_Negative
    };
    
}
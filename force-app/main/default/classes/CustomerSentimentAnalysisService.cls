public class CustomerSentimentAnalysisService extends CustomerSentimentService {
    
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
                'Conversation_Sentiment_Analyzer',
                templateInput
            );
        
        String sentimentAnalysisJSON = templateResponse.generations[0].text.trim();
        ConversationSentimentDTO sentimentAnalysis;
        try {
            sentimentAnalysis = (ConversationSentimentDTO)
                JSON.deserialize(sentimentAnalysisJSON, ConversationSentimentDTO.class);
        }
        catch (JSONException e) {
            System.debug(System.LoggingLevel.ERROR, e.getMessage());
            System.debug(System.LoggingLevel.ERROR, 'JSON received: ' + sentimentAnalysisJSON);
            throw new UnexpectedAnalysisStructureException('The structure of the sentiment analysis response is unexpected');
        }
        

        if (!customerSentiments.contains(sentimentAnalysis.classification)) {
            throw new UnexpectedSentimentException('The sentiment returned is unexpected: ' + sentimentAnalysis.classification);
        }
        
        return sentimentAnalysis;
    }
    
    private List<String> customerSentiments = new List<String>{
        System.Label.ConversationSentiment_Positive,
        System.Label.ConversationSentiment_Neutral,
        System.Label.ConversationSentiment_Negative
    };

}
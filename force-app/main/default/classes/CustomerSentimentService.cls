public class CustomerSentimentService {

    public String getCustomerSentiment(Id messagingSessionId) {
        if (messagingSessionId.getSobjectType() != Schema.MessagingSession.SObjectType) {
            throw new InvalidIdException('The provided ID is not a MessagingSession ID');
        }
        
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
            ConnectAPI.EinsteinLLM.generateMessagesForPromptTemplate(
                'Conversation_Sentiment_Analyzer',
                templateInput
            );
        
        String customerSentiment = templateResponse.generations[0].text;
        if (!customerSentiments.contains(customerSentiment)) {
            throw new UnexpectedSentimentException('The sentiment returned is not recognized');
        }
        
        return customerSentiment;
    }

    private List<String> customerSentiments = new List<String>{
        'Positive', 'Neutral', 'Negative'
    };

    public class InvalidIdException extends Exception {}
    public class UnexpectedSentimentException extends Exception {}
}
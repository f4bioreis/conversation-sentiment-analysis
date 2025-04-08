public class CustomerSentimentService {

    public String getCustomerSentiment(Id messagingSessionId) {
        if (messagingSessionId.getSobjectType() != Schema.MessagingSession.SObjectType) {
            throw new InvalidIdException('The provided ID is not a MessagingSession ID');
        }

        MessagingSession messagingSession = new messagingSession();
        messagingSession.Id = messagingSessionId;
        
        ConnectApi.WrappedValue sessionIdWrapper = new ConnectApi.WrappedValue();
        sessionIdWrapper.value = messagingSession;

        ConnectApi.EinsteinPromptTemplateGenerationsInput templateInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        templateInput.inputParams = new Map<String, ConnectApi.WrappedValue>();
        templateInput.inputParams.put('messagingSessionId', sessionIdWrapper);

        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation templateResponse =
            ConnectAPI.EinsteinLlm.generateMessagesForPromptTemplate(
                'Customer_Sentiment_Analyzer',
                templateInput
            );
        
        String customerSentiment = templateResponse.generations[0].text;
        if (!customerSentiments.contains(customerSentiment)) {
            throw new UnexpectedSentimentException('The sentiment returned is not recognized');
        }
        
        return customerSentiment;

    }

    private List<String> customerSentiments = new List<String>{
        'Positive',
        'Neutral',
        'Negative'
    };

    public class InvalidIdException extends Exception {}
    public class UnexpectedSentimentException extends Exception {}
}
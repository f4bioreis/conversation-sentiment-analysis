public class CustomerSentimentController {

    public static ICustomerSentimentService service = new CustomerSentimentService();
    
    @AuraEnabled
    public static ConversationSentimentDTO getCustomerSentiment(
        String messagingSessionId,
        Boolean includeExplanation
    ) {
        includeExplanation = includeExplanation ?? false;

        return service.getCustomerSentiment(messagingSessionId, includeExplanation);
    }
}
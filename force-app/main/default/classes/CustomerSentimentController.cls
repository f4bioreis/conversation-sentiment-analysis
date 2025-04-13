public class CustomerSentimentController {
    
    @AuraEnabled
    public static ConversationSentimentDTO getCustomerSentiment(
        String messagingSessionId,
        Boolean includeExplanation
    ) {
        includeExplanation = includeExplanation ?? false;

        CustomerSentimentService sentimentService = new CustomerSentimentService();
        return sentimentService.getCustomerSentiment(messagingSessionId, includeExplanation);
    }
}
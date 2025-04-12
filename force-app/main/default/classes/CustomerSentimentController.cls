public class CustomerSentimentController {
    
    @AuraEnabled
    public static ConversationSentimentDTO getCustomerSentiment(
        String messagingSessionId,
        Boolean includeExplanation
    ) {
        includeExplanation = includeExplanation ?? false;

        Map<Boolean, CustomerSentimentService> sentimentServiceMap = new Map<Boolean, CustomerSentimentService>{
            true => new CustomerSentimentAnalysisService(),
            false => new CustomerSentimentClassificationService()
        };

        CustomerSentimentService sentimentService = sentimentServiceMap.get(includeExplanation);
        return sentimentService.getCustomerSentiment(messagingSessionId);
    }
}
public class CustomerSentimentController {
    
    @AuraEnabled
    public static String getCustomerSentiment(String messagingSessionId) {
        CustomerSentimentService sentimentService = new CustomerSentimentService();
        return sentimentService.getCustomerSentiment(messagingSessionId);
    }
}
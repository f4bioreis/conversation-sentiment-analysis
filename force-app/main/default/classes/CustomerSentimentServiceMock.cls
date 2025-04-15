@IsTest
public class CustomerSentimentServiceMock implements ICustomerSentimentService {
    
    public ConversationSentimentDTO getCustomerSentiment(Id messagingSessionId, Boolean includeExplanation) {
        ConversationSentimentDTO sentimentAnalysisMock = new ConversationSentimentDTO();
        sentimentAnalysisMock.classification = System.Label.ConversationSentiment_Positive;
        sentimentAnalysisMock.explanation = 'This is an explanation example. It should explain the sentiment\'s classification';
        sentimentAnalysisMock.explanationLocale = 'This is a translated explanation example. It should contain the explanation in the user\'s language';
        return sentimentAnalysisMock;
    }
}
public interface ICustomerSentimentService {
    ConversationSentimentDTO getCustomerSentiment(Id messagingSessionId, Boolean includeExplanation);
}
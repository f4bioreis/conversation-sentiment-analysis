public abstract class CustomerSentimentService {

    public void validateId(Id messagingSessionId) {
        if (messagingSessionId.getSobjectType() != Schema.MessagingSession.SObjectType) {
            throw new InvalidIdException('The provided ID is not a MessagingSession ID');
        }
    }
    
    public abstract ConversationSentimentDTO getCustomerSentiment(Id messagingSessionId);

    public class InvalidIdException extends Exception {}
    public class UnexpectedSentimentException extends Exception {}
    public class UnexpectedAnalysisStructureException extends Exception {}
}
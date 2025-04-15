@IsTest
public class CustomerSentimentDataFactory {
    
    public static MessagingEndUser createMessagingUser(Id channelId) {
        MessagingEndUser user = new MessagingEndUser();
        user.Name = 'Messaging User';
        user.MessageType = 'Text';
        user.MessagingPlatformKey = 'v2/iamessage/UNAUTH/NA/uid:cf9bf7db-1111-2222-3333-49af3c5a037b';
        user.MessagingChannelId = channelId;
        return user;
    }

    public static MessagingSession createMessagingSession(Id channelId, Id userId) {
        MessagingSession session = new MessagingSession();
        session.Status = 'Ended';
        session.MessagingChannelId = channelId;
        session.MessagingEndUserId = userId;
        return session;
    }
}
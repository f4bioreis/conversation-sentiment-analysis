@IsTest
private class CustomerSentimentControllerTest {

    @TestSetup
    private static void setup() {
        MessagingChannel channel = [SELECT Id FROM MessagingChannel WHERE DeveloperName = 'Test_Channel'];

        MessagingEndUser user = CustomerSentimentDataFactory.createMessagingUser(channel.Id);
        Database.insert(user);

        MessagingSession session = CustomerSentimentDataFactory.createMessagingSession(channel.Id, user.Id);
        Database.insert(session);
    }
    
    @IsTest
    private static void testGetCustomerSentiment() {
        MessagingSession session = [SELECT Id FROM MessagingSession WHERE Status = 'Ended' LIMIT 1];

        CustomerSentimentController.service = new CustomerSentimentServiceMock();
        Test.startTest();

        ConversationSentimentDTO sentimentAnalysisMock =
            CustomerSentimentController.getCustomerSentiment(session.Id, true);
        Test.stopTest();

        Assert.isTrue( String.isNotBlank(sentimentAnalysisMock.classification), 'Expected a value to "classification"' );
        Assert.isTrue( String.isNotBlank(sentimentAnalysisMock.explanation), 'Expected a value to "explanation"' );
        Assert.isTrue( String.isNotBlank(sentimentAnalysisMock.explanationLocale), 'Expected a value to "explanationLocale"' );
    }
}
@IsTest
private class CustomerSentimentServiceTest {
    
    @IsTest
    private static void testGetCustomerSentimentInvalidId() {
        String invalidMessagingSessionId = UserInfo.getUserId();
        CustomerSentimentService sentimentService = new CustomerSentimentService();
        try {
            Test.startTest();
            sentimentService.getCustomerSentiment(invalidMessagingSessionId, true);
            Test.stopTest();
            Assert.fail('Expected InvalidIdException to be thrown');
        } catch (CustomerSentimentService.InvalidIdException e) {
            System.debug('Got expected exception');
        }
    }

    /**
     * At the time this test was written, ConnectApi methods are not mockable, making it
     * necessary to use seeAllData=true in this specific case to consume Prompt Templates
    */
    @IsTest(seeAllData=true)
    private static void testGetCustomerSentimentWithExplanation() {
        MessagingChannel channel = [SELECT Id FROM MessagingChannel WHERE DeveloperName = 'Test_Channel'];

        MessagingEndUser user = CustomerSentimentDataFactory.createMessagingUser(channel.Id);
        Database.insert(user);

        MessagingSession session = CustomerSentimentDataFactory.createMessagingSession(channel.Id, user.Id);
        Database.insert(session);

        CustomerSentimentService service = new CustomerSentimentService();
        Test.startTest();
        ConversationSentimentDTO sentimentAnalysis = service.getCustomerSentiment(session.Id, true);
        Test.stopTest();

        Assert.isTrue( String.isNotBlank(sentimentAnalysis.classification), 'Expected a value to "classification"' );
        Assert.isTrue( String.isNotBlank(sentimentAnalysis.explanation), 'Expected a value to "explanation"' );
        Assert.isTrue( String.isNotBlank(sentimentAnalysis.explanationLocale), 'Expected a value to "explanationLocale"' );
    }

    /**
     * At the time this test was written, ConnectApi methods are not mockable, making it
     * necessary to use seeAllData=true in this specific case to consume Prompt Templates
    */
    @IsTest(seeAllData=true)
    private static void testGetCustomerSentimentWithClassificationOnly() {
        MessagingChannel channel = [SELECT Id FROM MessagingChannel WHERE DeveloperName = 'Test_Channel'];

        MessagingEndUser user = CustomerSentimentDataFactory.createMessagingUser(channel.Id);
        Database.insert(user);

        MessagingSession session = CustomerSentimentDataFactory.createMessagingSession(channel.Id, user.Id);
        Database.insert(session);

        CustomerSentimentService service = new CustomerSentimentService();
        Test.startTest();
        ConversationSentimentDTO sentimentAnalysis = service.getCustomerSentiment(session.Id, false);
        Test.stopTest();

        Assert.isTrue( String.isNotBlank(sentimentAnalysis.classification), 'Expected a value to "classification"' );
    }
}
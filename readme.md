# Salesforce LWC - Conversation Sentiment Analyzer

This repository contains a Salesforce Lightning Web Component (LWC) and supporting Apex classes designed to analyze and classify the **sentiment** of a conversation from a `MessagingSession` record.

## 🔍 Features

- **Sentiment Analysis** powered by OpenAI's **GPT-4 Turbo** via a tuned prompt template for optimal classification accuracy.
- **LWC Badge Display** showing:
  - An icon representing the sentiment (positive, neutral, or negative)
  - The sentiment label itself
- **Mode** can be set via Lightning App Builder:
  - `Real-time`: Sentiment is analyzed as the conversation progresses.
  - `Analyze Button`: Sentiment analysis is triggered manually, when an "Analyze" button is clicked.
  - `Conversation End`: Sentiment is analyzed when the conversation ends.
- **Languages** currently supported are `English`, `Portuguese (Brazil)`, `Spanish`, `German` and `Dutch`.

## 🧠 How It Works

- The Apex controller retrieves conversation data from a `MessagingSession` record.
- A custom prompt template calls the GPT-4 Turbo model for sentiment classification.
- The result is displayed dynamically in the component on the record page.

## ⚙️ Setup

1. Deploy the LWC, Prompt Template and Apex classes to your Salesforce org.
2. Add the component to a **Lightning Page** in the **MessagingSession** object.
3. Set the **Mode** property based on your preferred sentiment analysis event.

⚠️ Make sure you have these enabled in your org:
- Omni-Channel
- Prompt Templates
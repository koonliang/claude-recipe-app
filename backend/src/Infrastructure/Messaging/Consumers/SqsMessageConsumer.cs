using Amazon.SQS;
using Amazon.SQS.Model;
using System.Text.Json;

namespace Infrastructure.Messaging.Consumers;

public class SqsMessageConsumer : IMessageConsumer
{
    private readonly IAmazonSQS _sqsClient;

    public SqsMessageConsumer(IAmazonSQS sqsClient)
    {
        _sqsClient = sqsClient;
    }

    public async Task<IEnumerable<T>> ReceiveMessagesAsync<T>(string queueUrl, CancellationToken cancellationToken = default) 
        where T : class
    {
        var request = new ReceiveMessageRequest
        {
            QueueUrl = queueUrl,
            MaxNumberOfMessages = 10,
            WaitTimeSeconds = 20
        };

        var response = await _sqsClient.ReceiveMessageAsync(request, cancellationToken);
        
        var messages = new List<T>();
        foreach (var message in response.Messages)
        {
            try
            {
                var deserializedMessage = JsonSerializer.Deserialize<T>(message.Body);
                if (deserializedMessage != null)
                {
                    messages.Add(deserializedMessage);
                }
            }
            catch (JsonException)
            {
            }
        }

        return messages;
    }

    public async Task DeleteMessageAsync(string queueUrl, string receiptHandle, CancellationToken cancellationToken = default)
    {
        var request = new DeleteMessageRequest
        {
            QueueUrl = queueUrl,
            ReceiptHandle = receiptHandle
        };

        await _sqsClient.DeleteMessageAsync(request, cancellationToken);
    }
}
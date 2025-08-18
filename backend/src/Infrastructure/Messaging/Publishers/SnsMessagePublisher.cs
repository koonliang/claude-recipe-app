using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using System.Text.Json;

namespace Infrastructure.Messaging.Publishers;

public class SnsMessagePublisher : IMessagePublisher
{
    private readonly IAmazonSimpleNotificationService _snsClient;

    public SnsMessagePublisher(IAmazonSimpleNotificationService snsClient)
    {
        _snsClient = snsClient;
    }

    public async Task PublishAsync<T>(T message, string topicArn, CancellationToken cancellationToken = default) 
        where T : class
    {
        var jsonMessage = JsonSerializer.Serialize(message);
        
        var request = new PublishRequest
        {
            TopicArn = topicArn,
            Message = jsonMessage,
            MessageAttributes = new Dictionary<string, MessageAttributeValue>
            {
                ["MessageType"] = new MessageAttributeValue
                {
                    DataType = "String",
                    StringValue = typeof(T).Name
                }
            }
        };

        await _snsClient.PublishAsync(request, cancellationToken);
    }
}
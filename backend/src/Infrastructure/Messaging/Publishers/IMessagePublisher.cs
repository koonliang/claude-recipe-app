namespace Infrastructure.Messaging.Publishers;

public interface IMessagePublisher
{
    Task PublishAsync<T>(T message, string topicArn, CancellationToken cancellationToken = default) where T : class;
}
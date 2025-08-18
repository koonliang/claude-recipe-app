namespace Infrastructure.Messaging.Consumers;

public interface IMessageConsumer
{
    Task<IEnumerable<T>> ReceiveMessagesAsync<T>(string queueUrl, CancellationToken cancellationToken = default) where T : class;
    Task DeleteMessageAsync(string queueUrl, string receiptHandle, CancellationToken cancellationToken = default);
}